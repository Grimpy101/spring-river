export default class Sampler {

    magFilter: number;
    minFilter: number;
    wrapS: number;
    wrapT: number;

    constructor(options: any = {}) {
        this.magFilter = options.mag || 9729;
        this.minFilter = options.min || 9729;
        this.wrapS = options.wrapS || 10497;
        this.wrapT = options.wrapT || 10497;
    }
}