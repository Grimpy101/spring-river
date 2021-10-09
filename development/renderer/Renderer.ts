import * as WebGL from './WebGL.js'
import shaders from '../shaders/shaders.js';
import BufferView from '../data/BufferView.js';
import Sampler from '../data/Sampler.js';
import Texture from '../data/Texture.js';
import Material from '../data/Material.js';
import Primitive from '../data/Primitive.js';
import Accessor from '../data/Accessor.js';
import Mesh from '../data/Mesh.js';
import Node from '../data/Node.js';
import Scene from '../data/Scene.js';
import Camera from '../data/camera/Camera.js';
import Vector3 from '../algebra/Vector3.js';
import Rotor from '../algebra/Rotor.js';
import PerspectiveCamera from '../data/camera/PerspectiveCamera.js';

export default class Renderer {

    gl: WebGL2RenderingContext;
    glObjects: Map<any, any>;
    programs: { [name: string]:
        { program: WebGLProgram; attributes: any; uniforms: any; }; };

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }

    prepareBufferView(bufferView: BufferView): WebGLBuffer {
        if (this.glObjects.has(bufferView)) {
            return this.glObjects.get(bufferView);
        }

        const buffer = new DataView(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength
        );
        const glBuffer = WebGL.createBuffer(this.gl, {
            target: bufferView.target,
            data:   buffer
        });
        this.glObjects.set(bufferView, glBuffer);
        return glBuffer;
    }

    prepareSampler(sampler: Sampler): WebGLSampler {
        if (this.glObjects.has(sampler)) {
            return this.glObjects.get(sampler);
        }

        const glSampler = WebGL.createSampler(this.gl, sampler);
        this.glObjects.set(sampler, glSampler);
        return glSampler;
    }

    prepareImage(image: HTMLImageElement): WebGLTexture {
        if (this.glObjects.has(image)) {
            return this.glObjects.get(image);
        }

        const glTexture = WebGL.createTexture(this.gl, { image });
        this.glObjects.set(image, glTexture);
        return glTexture;
    }

    prepareTexture(texture: Texture) {
        const gl = this.gl;

        this.prepareSampler(texture.sampler);
        const glTexture = this.prepareImage(texture.image);

        const mipmapModes = [
            gl.NEAREST_MIPMAP_NEAREST,
            gl.NEAREST_MIPMAP_LINEAR,
            gl.LINEAR_MIPMAP_NEAREST,
            gl.LINEAR_MIPMAP_LINEAR
        ];

        if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.minFilter)) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            texture.hasMipmaps = true;
        }
    }

    prepareMaterial(material: Material) {
        if (material.baseColorTexture) {
            this.prepareTexture(material.baseColorTexture);
        }
        if (material.metallicRoughnessTexture) {
            this.prepareTexture(material.metallicRoughnessTexture);
        }
        if (material.normalTexture) {
            this.prepareTexture(material.normalTexture);
        }
        if (material.occlusionTexture) {
            this.prepareTexture(material.occlusionTexture);
        }
        if (material.emissiveTexture) {
            this.prepareTexture(material.emissiveTexture);
        }
    }

    preparePrimitive(primitive: Primitive): WebGLVertexArrayObject {
        if (this.glObjects.has(primitive)) {
            return this.glObjects.get(primitive);
        }

        this.prepareMaterial(primitive.material);

        const gl = this.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        if (primitive.indices) {
            const bufferView = primitive.indices.bufferView;
            bufferView.target = gl.ELEMENT_ARRAY_BUFFER;
            const buffer = this.prepareBufferView(bufferView);
            gl.bindBuffer(bufferView.target, buffer);
        }

        const attributeNameToIndexMap: {[name: string]: number} = {
            POSITION:   0,
            TEXCOORD_0: 1
        };

        for (const name in primitive.attributes) {
            const accessor = primitive.attributes[name] as Accessor;
            const bufferView = accessor.bufferView;
            const attributeIndex = attributeNameToIndexMap[name];

            if (attributeIndex !== undefined) {
                bufferView.target = gl.ARRAY_BUFFER;
                const buffer = this.prepareBufferView(bufferView);
                gl.bindBuffer(bufferView.target, buffer);
                gl.enableVertexAttribArray(attributeIndex);
                gl.vertexAttribPointer(
                    attributeIndex,
                    accessor.numComponents,
                    accessor.componentType,
                    accessor.normalized,
                    bufferView.byteStride,
                    accessor.byteOffset
                );
            }
        }

        this.glObjects.set(primitive, vao);
        return vao;
    }

    prepareMesh(mesh: Mesh) {
        for (const primitive of mesh.primitives) {
            this.preparePrimitive(primitive);
        }
    }

    prepareNode(node: Node) {
        if (node.mesh) {
            this.prepareMesh(node.mesh);
        }
        for (const child of node.children) {
            this.prepareNode(child);
        }
    }

    prepareScene(scene: Scene) {
        for (const node of scene.nodes) {
            this.prepareNode(node);
        }
    }

    render(scene: Scene, camera: Node) {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.shader1;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        for (const node of scene.nodes) {
            this.renderNode(node, camera);
        }
    }

    renderNode(node: Node, cameraNode: Node) {
        const gl = this.gl;

        let transform = Vector3.subtract(node.transform, cameraNode.transform);
        const rotation = cameraNode.rotation.invert();
        transform = Vector3.rotate(transform, rotation);

        const vector4 = [transform.x, transform.y, transform.z, 1];

        if (cameraNode.camera instanceof PerspectiveCamera) {
            const matrix = [
                cameraNode.camera.spec0, 0, 0, 0,
                0, cameraNode.camera.f, 0, 0,
                0, 0, cameraNode.camera.spec1, -1,
                0, 0, cameraNode.camera.spec2, 0
            ];

            if (node.mesh) {
                const program = this.programs.shader1;
                gl.uniform4fv(program.uniforms.uTransform, vector4);
                gl.uniform4fv(program.uniforms.uRotor, node.rotation.toArray());
                gl.uniform3fv(program.uniforms.uScale, node.scale.toArray())
                gl.uniformMatrix4fv(program.uniforms.uMatrix, false, matrix);
                for (const primitive of node.mesh.primitives) {
                    this.renderPrimitive(primitive);
                }
            }

            for (const child of node.children) {
                this.renderNode(child, cameraNode);
            }
            node.clearTransforms();
        }
    }

    renderPrimitive(primitive: Primitive) {
        const gl = this.gl;

        const vao = this.glObjects.get(primitive);
        const material = primitive.material;
        const texture = material.baseColorTexture;
        const glTexture = this.glObjects.get(texture.image);
        const glSampler = this.glObjects.get(texture.sampler);

        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.bindSampler(0, glSampler);

        if (primitive.indices) {
            const mode = primitive.mode;
            const count = primitive.indices.count;
            const type = primitive.indices.componentType;
            gl.drawElements(mode, count, type, 0);
        } else {
            const mode = primitive.mode;
            const count = primitive.attributes.POSITION.count;
            gl.drawArrays(mode, 0, count);
        }
    }
}