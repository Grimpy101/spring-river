import Primitive from "./Primitive.js";

export default class Mesh {

    name: string;
    primitives: Primitive[];

    constructor(options: any) {
        this.primitives = options.primitives;
        this.name = options.name ? options.name : "Mesh";
    }
}