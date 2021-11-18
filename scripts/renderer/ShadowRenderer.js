import PerspectiveCamera from '../data/camera/PerspectiveCamera.js';
import { mat4, quat, vec3 } from '../external_libraries/glMatrix/index.js';
import RenderUtils from './RenderUtils.js';
export default class ShadowRenderer {
    constructor(gl, programs, glObjects) {
        this.gl = gl;
        this.programs = programs;
        this.glObjects = glObjects;
        this.quality = [512, 512];
        this.camera = null;
        const shadowDepthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, this.quality[0], this.quality[1], 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.shadowMap = shadowDepthTexture;
        this.shadowMVPMatrix = mat4.create();
    }
    createLightCamera(light) {
        this.camera.translation = vec3.clone(light.translation);
        vec3.add(this.camera.translation, this.camera.translation, vec3.fromValues(1.4, 4, 2.5));
        this.camera.rotation = quat.clone(light.rotation);
        quat.rotateX(this.camera.rotation, this.camera.rotation, Math.PI / 4.5);
        quat.rotateY(this.camera.rotation, this.camera.rotation, 0.05);
        this.camera.scale = [1, 1, 0.6];
        this.camera.camera = new PerspectiveCamera({
            name: "cam",
            type: "orth",
            aspect: 1,
            fov: 1,
            near: 0.1,
            far: Infinity
        });
        this.camera.updateMatrix();
        this.camera.camera.updateMatrix();
    }
    runShadowMap(scene, lights) {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.shadowMap);
        const shadowBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowMap, 0);
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("FrameBuffer error!\n" + status.toString());
        }
        this.createLightCamera(lights[0]);
        this._renderShadowMap(scene, this.quality);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    _renderShadowMap(scene, quality) {
        const gl = this.gl;
        gl.viewport(0, 0, quality[0], quality[1]);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.programs.shader_shadow.program);
        const mvpMatrix = RenderUtils.getCameraMatrix(this.camera);
        mat4.mul(mvpMatrix, this.camera.camera.matrix, mvpMatrix);
        this.shadowMVPMatrix = mat4.clone(mvpMatrix);
        for (const node of scene.nodes) {
            this._renderShadowNodes(node, mvpMatrix);
        }
    }
    _renderShadowNodes(node, mvpMatrix) {
        const gl = this.gl;
        mvpMatrix = mat4.clone(mvpMatrix);
        mat4.mul(mvpMatrix, mvpMatrix, node.matrix);
        if (node.mesh) {
            const program = this.programs.shader_shadow;
            gl.uniformMatrix4fv(program.uniforms.uMVPMatrix, false, mvpMatrix);
            for (const primitive of node.mesh.primitives) {
                this._renderShadowPrimitive(primitive);
            }
        }
        for (const child of node.children) {
            this._renderShadowNodes(child, mvpMatrix);
        }
    }
    _renderShadowPrimitive(primitive) {
        const gl = this.gl;
        const vao = this.glObjects.get(primitive);
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
//# sourceMappingURL=ShadowRenderer.js.map