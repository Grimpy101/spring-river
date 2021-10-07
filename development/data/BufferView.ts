export default class BufferView {

    buffer: any;
    byteLength: number;
    byteOffset: number;
    byteStride: number;
    target: number;

    constructor(options: any) {
        this.buffer = options.buffer;
        this.byteLength = options.byteLength || 0;
        this.byteOffset = options.byteOffset || 0;
        this.byteStride !== undefined ? options.byteStride : null;
        this.target = options.target || null;
    }
}