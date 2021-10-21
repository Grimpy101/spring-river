import * as WebGL from './WebGL.js';
import shaders from '../shaders/shaders.js';
import RenderUtils from './RenderUtils.js';
import ShadowRenderer from './ShadowRenderer.js';
import { mat4, vec4 } from '../external_libraries/glMatrix/index.js';
export default class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);
        this.shadowRenderer = new ShadowRenderer(gl, this.programs, this.glObjects);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }
    prepareBufferView(bufferView) {
        if (this.glObjects.has(bufferView)) {
            return this.glObjects.get(bufferView);
        }
        const buffer = new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
        const glBuffer = WebGL.createBuffer(this.gl, {
            target: bufferView.target,
            data: buffer
        });
        this.glObjects.set(bufferView, glBuffer);
        return glBuffer;
    }
    prepareSampler(sampler) {
        if (this.glObjects.has(sampler)) {
            return this.glObjects.get(sampler);
        }
        const glSampler = WebGL.createSampler(this.gl, sampler);
        this.glObjects.set(sampler, glSampler);
        return glSampler;
    }
    prepareImage(image) {
        if (this.glObjects.has(image)) {
            return this.glObjects.get(image);
        }
        const glTexture = WebGL.createTexture(this.gl, { image });
        this.glObjects.set(image, glTexture);
        return glTexture;
    }
    prepareTexture(texture) {
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
    prepareMaterial(material) {
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
    preparePrimitive(primitive) {
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
        const attributeNameToIndexMap = {
            POSITION: 0,
            TEXCOORD_0: 1,
            NORMAL: 2
        };
        for (const name in primitive.attributes) {
            const accessor = primitive.attributes[name];
            const bufferView = accessor.bufferView;
            const attributeIndex = attributeNameToIndexMap[name];
            if (attributeIndex !== undefined) {
                bufferView.target = gl.ARRAY_BUFFER;
                const buffer = this.prepareBufferView(bufferView);
                gl.bindBuffer(bufferView.target, buffer);
                gl.enableVertexAttribArray(attributeIndex);
                gl.vertexAttribPointer(attributeIndex, accessor.numComponents, accessor.componentType, accessor.normalized, bufferView.byteStride, accessor.byteOffset);
            }
        }
        this.glObjects.set(primitive, vao);
        return vao;
    }
    prepareMesh(mesh) {
        for (const primitive of mesh.primitives) {
            this.preparePrimitive(primitive);
        }
    }
    prepareNode(node) {
        if (node.mesh) {
            this.prepareMesh(node.mesh);
        }
        for (const child of node.children) {
            this.prepareNode(child);
        }
    }
    prepareScene(scene) {
        for (const node of scene.nodes) {
            this.prepareNode(node);
        }
    }
    getLightPosition(light) {
        const mvpMatrix = mat4.create();
        let parent = light.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        const vector = vec4.fromValues(light.translation[0], light.translation[1], light.translation[2], 1);
        vec4.transformMat4(vector, vector, mvpMatrix);
        return vector;
    }
    calculateLightInformation(light, camMatrix) {
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
        };
    }
    render(scene, camera, lights, program) {
        this.shadowRenderer.runShadowMap(scene, lights);
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
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, camera.camera.matrix);
        for (const node of scene.nodes) {
            this.renderNode(node, camMatrix, lights, program);
        }
    }
    renderNode(node, transMatrix, lights, program) {
        const gl = this.gl;
        transMatrix = mat4.clone(transMatrix);
        mat4.mul(transMatrix, transMatrix, node.matrix);
        if (node.mesh) {
            const biasMatrix = mat4.fromValues(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
            const depthBiasMVP = mat4.create();
            mat4.invert(depthBiasMVP, this.shadowRenderer.shadowMVPMatrix);
            mat4.mul(depthBiasMVP, biasMatrix, depthBiasMVP);
            gl.uniformMatrix4fv(program.uniforms.uViewModel, false, transMatrix);
            gl.uniformMatrix4fv(program.uniforms.uDepthMatrix, false, depthBiasMVP);
            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive);
            }
        }
        for (const child of node.children) {
            this.renderNode(child, transMatrix, lights, program);
        }
    }
    renderPrimitive(primitive) {
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
        }
        else {
            const mode = primitive.mode;
            const count = primitive.attributes.POSITION.count;
            gl.drawArrays(mode, 0, count);
        }
    }
}
//# sourceMappingURL=Renderer.js.map