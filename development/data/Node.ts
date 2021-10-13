import Camera from "./camera/Camera.js";
import Light from "./light/Light.js";
import Mesh from "./Mesh.js";
import { mat4, vec3, quat } from "../external_libraries/glMatrix/index.js";

export default class Node {

    name: string | null;

    translation: any;
    rotation: any;
    scale: any;

    matrix: any;

    parent: Node;
    children: Node[];

    mesh: Mesh;
    camera: Camera;
    light: Light;

    constructor(options: any = {}) {
        this.name = options.name || null;

        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);

        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();

        if (options.matrix) {
            this.updateTransforms();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }
        
        this.camera = options.camera || null;
        this.mesh = options.mesh || null;
        this.light = options.light || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;
    }

    updateTransforms() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale
        );
    }

    addChild(node: Node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node: Node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    clone(): Node {
        return new Node({
            ...this,
            children: this.children.map(child => child.clone())
        });
    }
}