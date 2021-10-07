import Vector3 from "../../algebra/Vector3.js";

export default class Light {

    name: string;
    type: string;
    intensity: number;
    color: Vector3;
    range: number;

    constructor(options: any = {}) {
        this.name = options.name ? options.name : "";
        this.type = options.type || null;
        this.intensity = options.intensity || 1.0;
        this.range = options.range || 0;
        this.color = options.color ? new Vector3(options.color) : new Vector3([1, 1, 1]);
    }
}