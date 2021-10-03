import { GlTf } from "../schemas/GLTF_types.js";
import Node from "./Node.js";

export default class Scene {

    name: string;
    nodes: Node[];

    constructor(options: any = {}) {
        this.nodes = [...(options.nodes || [])];
    }

    addNode(node: Node) {
        this.nodes.push(node);
    }

    traverseNode(node: Node, before: Function, after: Function) {
        if (before) {
            before(node);
        }
        for (const child of node.children) {
            this.traverseNode(child, before, after);
        }
        if (after) {
            after(node);
        }
    }

    traverse(before: Function, after: Function) {
        for (const node of this.nodes) {
            this.traverseNode(node, before, after);
        }
    }

    /*
    clone() {
        return new Scene({
            ...this,
            nodes: this.nodes.map(node => node.clone()),
        });
    }*/
}