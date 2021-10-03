import BufferView from "./BufferView.js";

export default class Accessor {

    bufferView: BufferView;
    byteOffset: number;
    componentType: number;
    normalized: boolean;
    count: number;
    max: number[];
    min: number[];
    numComponents: number;

    constructor(options: any) {
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