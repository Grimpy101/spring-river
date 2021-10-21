import OrthographicCamera from "./data/camera/OrthographicCamera.js";
import PerspectiveCamera from "./data/camera/PerspectiveCamera.js";
import Mesh from "./data/Mesh.js";
import Node from "./data/Node.js";
import Primitive from "./data/Primitive.js";
import Scene from "./data/Scene.js";
import GLTFImporter from "./importer/GLTFImporter.js";
import Interactions from "./interaction/Interactions.js";
import Renderer from "./renderer/Renderer.js";

class Application {

    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;

    importer: GLTFImporter;
    renderer: Renderer;
    interactor: Interactions

    scene: Scene;
    camera: Node;
    lights: Node[];

    lastTime: number;

    constructor(canvas: HTMLCanvasElement) {
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
        } catch (error) {
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

    async start() {
        this.importer = new GLTFImporter();
        await this.importer.load('../level_01/test_scene.gltf');

        this.scene = await this.importer.loadScene(this.importer.defaultScene);
        this.camera = (await this.importer.loadNode('Camera')).children[0];

        if (!this.scene || !this.camera) {
            throw new Error("Scene ali kamere ni.");
        }

        if (!this.camera.camera) {
            throw new Error("Vozlisce s kamero ne vsebuje objekta kamere");
        }

        this.lights = [];
        for (const node of this.scene.nodes) {
            this.pushLight(node);
        }

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.interactor = new Interactions(this.camera);
        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        this.enableInteraction = this.enableInteraction.bind(this);
        this.canvas.addEventListener('click', this.enableInteraction);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.lastTime = Date.now();
    }

    update() {
        if (this.camera) {
            let nowTime = Date.now();
            let dt = (nowTime - this.lastTime) / 1000;
            if (this.interactor) {
                this.interactor.step(dt);
            }
            this.lastTime = nowTime;
        }
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene,
                this.camera,
                this.lights,
                this.renderer.programs.shader1);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            if (this.camera.camera instanceof PerspectiveCamera) {
                this.camera.camera.aspectRatio = aspectRatio;
                this.camera.camera.updateMatrix();
            }
            if (this.camera.camera instanceof OrthographicCamera) {
                this.camera.camera.updateMatrix();
            }
        }
    }

    pushLight(node: Node) {
        if (node.light) {
            this.lights.push(node);
        }
        for (const child of node.children) {
            this.pushLight(child);
        }
    }

    enableInteraction() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.interactor.enable();
        } else {
            this.interactor.disable();
        }
    }

}

window.addEventListener('load', () => {
    const canvas = document.getElementById('gl_canvas') as HTMLCanvasElement;
    const app = new Application(canvas);
    console.log("Dela!");
});