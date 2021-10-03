import Material from "./Material.js";
import Accessor from "./Accessor.js";

export default class Primitive {
    
    mode: number;
    attributes: any;
    indices: Accessor;
    material: Material;

    constructor(options: any) {
        this.mode = options.mode;
        this.attributes = options.attributes;
        this.indices = options.indices;
        this.material = options.material;
    }
}