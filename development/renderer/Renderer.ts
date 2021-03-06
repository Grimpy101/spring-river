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
import RenderUtils from './RenderUtils.js'
import ShadowRenderer from './ShadowRenderer.js';
import { mat4, vec4 } from '../external_libraries/glMatrix/index.js';

export default class Renderer {

    gl: WebGL2RenderingContext;
    glObjects: Map<any, any>;
    programs: { [name: string]:
        { program: WebGLProgram; attributes: any; uniforms: any; }; };

    shadowRenderer: ShadowRenderer;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);
        this.shadowRenderer = new ShadowRenderer(gl, this.programs, this.glObjects);

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
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
            TEXCOORD_0: 1,
            NORMAL: 2
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

    getLightPosition(light: Node) {
        const mvpMatrix = mat4.create();
        let parent = light.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        const vector = vec4.fromValues(
            light.translation[0],
            light.translation[1],
            light.translation[2],
            1
        );
        vec4.transformMat4(vector, vector, mvpMatrix);
        return vector;
    }

    calculateLightInformation(light: Node, camMatrix: any) {
        const l = light.light;

        let range = l.range;
        let ambientColor = [56, 56, 56];
        let diffuseColor = l.color;
        let specularColor = l.color;
        let shininess = l.intensity * 0.5;
        let position = this.getLightPosition(light);
        vec4.transformMat4(position, position, camMatrix);

        return {
            "range": range,
            "ambientColor": ambientColor,
            "diffuseColor": diffuseColor,
            "specularColor": specularColor,
            "shininess": shininess,
            "position": position
        }
    }

    textureTest() {
        const verts = [];
    }


    render(scene: Scene, camera: Node, lights: Node[], program: {program: WebGLProgram;attributes: any;uniforms: any;}) {
        this.shadowRenderer.camera = camera.clone();
        this.shadowRenderer.runShadowMap(scene, lights);
        //camera = this.shadowRenderer.camera;

        const gl = this.gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 1);
        gl.uniform1i(program.uniforms.uShadowMap, 0);
        gl.uniform1i(program.uniforms.uNormalMap, 2);

        const camMatrix = RenderUtils.getCameraMatrix(camera);
        const lightProperties = this.calculateLightInformation(lights[0], camMatrix);

        gl.uniform3fv(program.uniforms.uAmbientColor, lightProperties.ambientColor);
        gl.uniform3fv(program.uniforms.uDiffuseColor, lightProperties.diffuseColor);
        gl.uniform3fv(program.uniforms.uSpecularColor, lightProperties.specularColor);
        gl.uniform4fv(program.uniforms.uLightPosition, lightProperties.position);
        gl.uniform1f(program.uniforms.uShininess, lightProperties.shininess);
        gl.uniform1f(program.uniforms.uLightRange, lightProperties.range);

        gl.uniformMatrix4fv(program.uniforms.uProjectionMatrix, false, camera.camera.matrix);

        const shadowMatrix = this.shadowRenderer.shadowMVPMatrix;

        for (const node of scene.nodes) {
            this.renderNode(node, camMatrix, shadowMatrix, lights, program);
        }
        //this.textureTest();
    }

    renderNode(node: Node, transMatrix: any, shadowMatrix: any, lights: Node[], program: {program: WebGLProgram;attributes: any;uniforms: any;}) {
        const gl = this.gl;

        transMatrix = mat4.clone(transMatrix);
        mat4.mul(transMatrix, transMatrix, node.matrix);
        shadowMatrix = mat4.clone(shadowMatrix);
        mat4.mul(shadowMatrix, shadowMatrix, node.matrix);
        //console.log("NR: " + node.name, shadowMatrix);
        const depthMatrix = mat4.clone(shadowMatrix);
        const biasMatrix = mat4.fromValues(
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0
        );
        mat4.mul(depthMatrix, depthMatrix, biasMatrix);

        if (node.mesh) {
            gl.uniformMatrix4fv(program.uniforms.uViewModelMatrix,
                false, transMatrix);
            gl.uniformMatrix4fv(program.uniforms.uShadowMatrix,
                false, depthMatrix);
            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive);
            }
        }

        for (const child of node.children) {
            this.renderNode(child, transMatrix, shadowMatrix, lights, program);
        }
    }

    renderPrimitive(primitive: Primitive) {
        const gl = this.gl;

        const vao = this.glObjects.get(primitive);
        const material = primitive.material;
        const texture = material.baseColorTexture;
        const normalMap = material.normalTexture;

        if (texture) {
            const glTexture = this.glObjects.get(texture.image);
            const glSampler = this.glObjects.get(texture.sampler);

            gl.bindVertexArray(vao);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.bindSampler(1, glSampler);
        }

        if (normalMap) {
            const glNormalMap = this.glObjects.get(normalMap.image);
            const glNormalMapSampler = this.glObjects.get(normalMap.sampler);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, glNormalMap);
            gl.bindSampler(2, glNormalMapSampler);
        }

        if (this.shadowRenderer.shadowMap) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.shadowRenderer.shadowMap);
        }

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