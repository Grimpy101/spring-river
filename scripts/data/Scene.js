export default class Scene {
    constructor(options = {}) {
        this.nodes = [...(options.nodes || [])];
    }
    addNode(node) {
        this.nodes.push(node);
    }
    traverseNode(node, before, after) {
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
    traverse(before, after) {
        for (const node of this.nodes) {
            this.traverseNode(node, before, after);
        }
    }
}
//# sourceMappingURL=Scene.js.map