import Material from "./Material.js";
export default class Primitive {
    constructor(options) {
        this.mode = options.mode !== undefined ? options.mode : 4;
        this.attributes = Object.assign({}, (options.attributes || {}));
        this.indices = options.indices || null;
        this.material = options.material || new Material();
    }
}
//# sourceMappingURL=Primitive.js.map