import { mat4, vec3, quat } from "../../external_libraries/glMatrix/index.js";

export default class Camera {

    name: string;
    type: string;

    matrix: any;

    constructor(options: any) {
        this.name = options.name ? options.name : "Camera";
        this.type = options.type ? options.type : "unknown";

        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();
    }

    updateMatrix() {}
}