import { mat4 } from "../../external_libraries/glMatrix/index.js";
export default class Camera {
    constructor(options) {
        this.name = options.name ? options.name : "Camera";
        this.type = options.type ? options.type : "unknown";
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();
    }
    updateMatrix() { }
}
//# sourceMappingURL=Camera.js.map