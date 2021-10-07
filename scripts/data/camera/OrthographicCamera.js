import Camera from "./Camera.js";
export default class OrthographicCamera extends Camera {
    constructor(options) {
        super(options);
        this.left = options.left;
        this.right = options.right;
        this.bottom = options.bottom;
        this.top = options.top;
        this.near = options.near;
        this.far = options.far ? options.far : -1;
    }
}
//# sourceMappingURL=OrthographicCamera.js.map