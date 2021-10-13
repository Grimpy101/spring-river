import { mat4 } from "../../external_libraries/glMatrix/index.js";
import Camera from "./Camera.js";
export default class PerspectiveCamera extends Camera {
    constructor(options) {
        super(options);
        this.aspectRatio = options.aspect || 1.5;
        this.yfov = options.fov || 1.5;
        this.znear = options.near || 1;
        this.zfar = options.far || Infinity;
        this.updateMatrix();
    }
    updateMatrix() {
        mat4.perspective(this.matrix, this.yfov, this.aspectRatio, this.znear, this.zfar);
    }
}
//# sourceMappingURL=PerspectiveCamera.js.map