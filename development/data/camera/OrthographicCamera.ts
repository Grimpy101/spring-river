import Camera from "./Camera.js";

export default class OrthographicCamera extends Camera {

    left: number;
    right: number;
    bottom: number;
    top: number;
    near: number;
    far: number;

    constructor(options: any) {
        super(options);
        this.left = options.left;
        this.right = options.right;
        this.bottom = options.bottom;
        this.top = options.top;
        this.near = options.near;
        this.far = options.far ? options.far : -1;
    }
}