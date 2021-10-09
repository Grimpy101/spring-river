import Vector3 from "../algebra/Vector3.js";
import Rotor from "../algebra/Rotor.js";

import Camera from "./camera/Camera.js";
import Light from "./light/Light.js";
import Mesh from "./Mesh.js";

export default class Node {

    name: string | null;

    translation: Vector3;
    rotation: Rotor;
    scale: Vector3;

    transform: Vector3;

    parent: Node;
    children: Node[];

    mesh: Mesh;
    camera: Camera;
    light: Light;

    constructor(options: any = {}) {
        this.name = options.name || null;

        const translation = options.translation || [0, 0, 0];
        const rotation = options.rotation || [0, 0, 0, 1];
        const scale = options.scale || [1, 1, 1];

        this.translation = new Vector3(translation);
        this.scale = new Vector3(scale);
        this.rotation = Rotor.quat2rotor(rotation);

        this.transformFromTRS();
        
        this.camera = options.camera || null;
        this.mesh = options.mesh || null;
        this.light = options.light || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;
    }

    updateTransform() {
        if (this.parent) {
            this.transform = Vector3.add(this.transform, this.parent.transform);
            this.transform = Vector3.scale(this.transform, this.parent.scale);
            this.transform = Vector3.rotate(this.transform, this.parent.rotation);
        }
        this.transform = Vector3.add(this.transform, this.translation);
    }

    transformFromTRS() {
        if (this.parent) {
            this.transform = Vector3.add(this.translation, this.parent.transform);
            this.transform = Vector3.scale(this.transform, this.parent.scale)
            this.transform = Vector3.rotate(this.transform, this.parent.rotation);
        } else {
            this.transform = this.translation.clone();
        }
    }

    clearTransforms() {
        this.translation = new Vector3([0, 0, 0]);
        this.scale = new Vector3([1, 1, 1]);
        this.rotation = new Rotor(0, [0, 0, 0]);
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