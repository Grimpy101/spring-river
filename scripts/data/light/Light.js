import { vec3 } from "../../external_libraries/glMatrix/index.js";
export default class Light {
    constructor(options = {}) {
        this.name = options.name ? options.name : "";
        this.type = options.type || null;
        this.intensity = options.intensity || 1.0;
        this.range = options.range || 10;
        this.color = options.color
            ? vec3.clone(options.color)
            : vec3.fromValues(1, 1, 1);
    }
}
//# sourceMappingURL=Light.js.map