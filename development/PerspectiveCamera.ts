import Camera from "./Camera.js";

export default class PerspectiveCamera extends Camera{

    aspectRatio: number;
    yfov: number;
    zfar: number;
    znear: number;
}