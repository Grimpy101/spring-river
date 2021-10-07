import Light from "./Light.js";

export default class SpotLight extends Light {

    innerConeAngle: number;
    outerConeAngle: number;

    constructor(options: any = {}) {
        super(options);
        this.innerConeAngle = options.innerConeAngle || 0;
        this.outerConeAngle = options.outerConeAngle || (Math.PI / 4.0);
    }
}