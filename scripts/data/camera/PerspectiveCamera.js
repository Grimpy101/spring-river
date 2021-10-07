import Camera from "./Camera.js";
export default class PerspectiveCamera extends Camera {
    constructor(options) {
        super(options);
        this.aspectRatio = options.aspect;
        this.yfov = options.fov;
        this.znear = options.near;
        this.zfar = options.far;
        this.updateTransform();
    }
    updateTransform() {
        this.f = 1 / Math.tan(this.yfov / 2);
        this.spec0 = this.f / this.aspectRatio;
        if (this.zfar != null && this.zfar !== Infinity) {
            let nf = 1 / (this.znear - this.zfar);
            this.spec1 = (this.zfar + this.znear) * nf;
            this.spec2 = 2 * this.zfar * this.znear * nf;
        }
        else {
            this.spec1 = -1;
            this.spec2 = -2 * this.znear;
        }
    }
}
//# sourceMappingURL=PerspectiveCamera.js.map