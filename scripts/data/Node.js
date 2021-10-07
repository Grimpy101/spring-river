import Vector3 from "../algebra/Vector3.js";
import Rotor from "../algebra/Rotor.js";
export default class Node {
    constructor(options = {}) {
        this.name = options.name || null;
        const translation = options.translation || [0, 0, 0];
        const rotation = options.rotation || [0, 0, 0, 1];
        const scale = options.scale || [1, 1, 1];
        this.translation = new Vector3(translation);
        this.scale = new Vector3(scale);
        this.rotation = Rotor.quat2rotor(rotation);
        this.updateTransform();
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
            this.transform = Vector3.add(this.parent.transform, this.translation);
        }
        else {
            this.transform = this.translation.clone();
        }
        this.transform = Vector3.scale(this.transform, this.scale);
        this.transform = Vector3.rotate(this.transform, this.rotation);
    }
    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }
    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }
    clone() {
        return new Node(Object.assign(Object.assign({}, this), { children: this.children.map(child => child.clone()) }));
    }
}
//# sourceMappingURL=Node.js.map