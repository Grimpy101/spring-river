export default class Sampler {
    constructor(options = {}) {
        this.magFilter = options.mag || 9729;
        this.minFilter = options.min || 9729;
        this.wrapS = options.wrapS || 10497;
        this.wrapT = options.wrapT || 10497;
    }
}
//# sourceMappingURL=Sampler.js.map