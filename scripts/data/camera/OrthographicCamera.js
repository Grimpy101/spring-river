import { mat4 } from "../../external_libraries/glMatrix/index.js";
import Camera from "./Camera.js";
export default class OrthographicCamera extends Camera {
    constructor(options) {
        super(options);
        this.left = options.left;
        this.right = options.right;
        this.bottom = options.bottom;
        this.top = options.top;
        this.near = options.near;
        this.far = options.far ? options.far : -1;
        this.updateMatrix();
    }
    updateMatrix() {
        mat4.ortho(this.matrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
}
//# sourceMappingURL=OrthographicCamera.js.map