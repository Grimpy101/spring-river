import Light from "./Light.js";
export default class SpotLight extends Light {
    constructor(options = {}) {
        super(options);
        this.innerConeAngle = options.innerConeAngle || 0;
        this.outerConeAngle = options.outerConeAngle || (Math.PI / 4.0);
    }
}
//# sourceMappingURL=SpotLight.js.map