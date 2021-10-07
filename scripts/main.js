var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import PerspectiveCamera from "./data/camera/PerspectiveCamera.js";
import GLTFImporter from "./importer/GLTFImporter.js";
import Renderer from "./renderer/Renderer.js";
class Application {
    constructor(canvas) {
        this.canvas = canvas;
        this._update = this._update.bind(this);
        this._initGL();
        this.start();
        requestAnimationFrame(this._update);
    }
    _initGL() {
        this.gl = null;
        try {
            this.gl = this.canvas.getContext('webgl2', {
                preserveDrawingBuffer: true
            });
        }
        catch (error) {
            throw new Error(error);
        }
        if (!this.gl) {
            throw new Error("Cannot create WebGL 2.0 context");
        }
    }
    _update() {
        this._resize();
        this.update();
        this.render();
        requestAnimationFrame(this._update);
    }
    _resize() {
        const canvas = this.canvas;
        const gl = this.gl;
        if (canvas.width !== canvas.clientWidth ||
            canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            this.resize();
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.importer = new GLTFImporter();
            yield this.importer.load('../level_01/test_scene.gltf');
            this.scene = yield this.importer.loadScene(this.importer.defaultScene);
            this.camera = (yield this.importer.loadNode('Camera')).children[0];
            console.log(this.scene);
            if (!this.scene || !this.camera) {
                throw new Error("Scene ali kamere ni.");
            }
            if (!this.camera.camera) {
                throw new Error("Vozlisce s kamero ne vsebuje objekta kamere");
            }
            this.renderer = new Renderer(this.gl);
            this.renderer.prepareScene(this.scene);
            this.resize();
        });
    }
    update() { }
    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;
        if (this.camera && this.camera.camera instanceof PerspectiveCamera) {
            this.camera.camera.aspectRatio = aspectRatio;
            this.camera.camera.updateTransform();
        }
    }
}
window.addEventListener('load', () => {
    const canvas = document.getElementById('gl_canvas');
    const app = new Application(canvas);
    console.log("Dela!");
});
//# sourceMappingURL=main.js.map