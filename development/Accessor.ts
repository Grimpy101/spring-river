import BufferView from "./BufferView.js";

export default class Accessor {

    bufferView: BufferView;
    byteOffset: number;
    componentType: number;
    count: number;
    max: number[];
    min: number[];
    type: string;
}