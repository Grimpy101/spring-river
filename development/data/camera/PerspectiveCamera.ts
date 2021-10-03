import Camera from "./Camera.js";

export default class PerspectiveCamera extends Camera{

    aspectRatio: number;
    yfov: number;
    zfar: number;
    znear: number;

    constructor(options: any) {
        super(options);
        this.aspectRatio = options.aspect;
        this.yfov = options.fov;
        this.znear = options.near;
        this.zfar = options.far;
    }
}