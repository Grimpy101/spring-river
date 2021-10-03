import Camera from "./camera/Camera.js";
import Light from "./light/Light.js";
import Mesh from "./Mesh.js";

export default class Node {

    name: string | null;

    translation: number[];
    rotation: number[];
    scale: number[];

    parent: Node;
    children: Node[];

    mesh: Mesh;
    camera: Camera;
    light: Light;

    constructor(options: any = {}) {
        // TODO: Add translation, rotation, scale
        this.camera = options.camera || null;
        this.mesh = options.mesh || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;
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