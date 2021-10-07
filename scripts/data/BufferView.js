export default class BufferView {
    constructor(options) {
        this.buffer = options.buffer;
        this.byteLength = options.byteLength || 0;
        this.byteOffset = options.byteOffset || 0;
        this.byteStride !== undefined ? options.byteStride : null;
        this.target = options.target || null;
    }
}
//# sourceMappingURL=BufferView.js.map