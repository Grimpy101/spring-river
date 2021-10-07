import Vector3 from "../../algebra/Vector3.js";
export default class Light {
    constructor(options = {}) {
        this.name = options.name ? options.name : "";
        this.type = options.type || null;
        this.intensity = options.intensity || 1.0;
        this.range = options.range || 0;
        this.color = options.color ? new Vector3(options.color) : new Vector3([1, 1, 1]);
    }
}
//# sourceMappingURL=Light.js.map