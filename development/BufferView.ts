import Buffer from "./Buffer.js";

export default class BufferView {

    buffer: Buffer;
    byteLength: number;
    byteOffset: number;
    target: number;
    byteStride: number;
}