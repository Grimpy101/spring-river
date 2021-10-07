import Sampler from "./Sampler.js";

export default class Texture {

    sampler: Sampler;
    image: HTMLImageElement;
    hasMipmaps: boolean;

    constructor(options: any = {}) {
        this.image = options.image || null;
        this.sampler = options.sampler || new Sampler();
        this.hasMipmaps = false;
    }
}