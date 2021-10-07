import Material from "./Material.js";
import Accessor from "./Accessor.js";

export default class Primitive {
    
    mode: number;
    attributes: any;
    indices: Accessor;
    material: Material;

    constructor(options: any) {
        this.mode = options.mode !== undefined ? options.mode : 4;
        this.attributes = {...(options.attributes || {})};
        this.indices = options.indices || null;
        this.material = options.material || new Material();
    }
}