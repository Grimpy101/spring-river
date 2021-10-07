export default class Accessor {
    constructor(options = {}) {
        this.bufferView = options.bufferView || null;
        this.byteOffset = options.byteOffset || 0;
        this.componentType = options.componentType || 5120;
        this.normalized = options.normalized || false;
        this.count = options.count || 0;
        this.max = options.max || null;
        this.min = options.min || null;
        this.numComponents = options.numComponents || 0;
    }
}
//# sourceMappingURL=Accessor.js.map