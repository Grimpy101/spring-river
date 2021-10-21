import Primitive from '../data/Primitive.js';
import Node from '../data/Node.js';
import Scene from '../data/Scene.js';
import PerspectiveCamera from '../data/camera/PerspectiveCamera.js';
import { mat4, quat, vec3, vec4 } from '../external_libraries/glMatrix/index.js';
import RenderUtils from './RenderUtils.js';

export default class ShadowRenderer {

    gl: WebGL2RenderingContext;
    programs: { [name: string]:
        { program: WebGLProgram; attributes: any; uniforms: any; }; };
    glObjects: Map<any, any>;

    shadowMap: WebGLTexture;
    shadowMVPMatrix: any;

    constructor(gl: WebGL2RenderingContext, programs: any, glObjects: Map<any, any>) {
        this.gl = gl;
        this.programs = programs;
        this.glObjects = glObjects;

        this.shadowMap = null;
        this.shadowMVPMatrix = mat4.create();
    }

    createLightCamera(light: Node) {
        const lightCamera = new PerspectiveCamera({
            name: "light_camera",
            type: "perspective",
            aspectRatio: 1.7777777777777777,
            yfov: 0.8074908757770757,
            zfar : 100,
            znear : 0.10000000149011612
        });

        const lightCameraNode = new Node({
            name: "light_camera_node",
            translation: light.translation,
            rotation: [0.34672799706459045,
                0.26099100708961487,
                -0.10108300298452377,
                0.895235002040863],
            scale: [1, 1, 1],
            camera: lightCamera
        });
        lightCamera.updateMatrix();
        return lightCameraNode;
    }

    runShadowMap(scene: Scene, lights: Node[]) {
        const gl = this.gl;

        let quality = [512, 512];

        const shadowDepthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT24,
            quality[0], quality[1],
            0,
            gl.DEPTH_COMPONENT,
            gl.UNSIGNED_INT,
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        const shadowBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowBuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            shadowDepthTexture,
            0
        );

        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("FrameBuffer error!\n" + status.toString());
        }

        const cameraNode = this.createLightCamera(lights[0]);
        this._renderShadowMap(scene, cameraNode, quality);

        this.shadowMap = shadowDepthTexture;

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    _renderShadowMap(scene: Scene, camera: Node, quality: number[]) {
        const gl = this.gl;
        gl.viewport(0, 0, quality[0], quality[1]);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.programs.shader_shadow.program);

        const mvpMatrix = RenderUtils.getCameraMatrix(camera);
        this.shadowMVPMatrix = mvpMatrix;
        for (const node of scene.nodes) {
            this._renderShadowNodes(node, mvpMatrix)
        }
    }

    _renderShadowNodes(node: Node, mvpMatrix: any) {
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

    _renderShadowPrimitive(primitive: Primitive) {
        const gl = this.gl;

        const vao = this.glObjects.get(primitive);

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