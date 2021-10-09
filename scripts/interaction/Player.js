import Rotor from "../algebra/Rotor.js";
export default class PlayerInteraction {
    constructor(node) {
        this.mouseSensitivity = 0.002;
        this.velocity = [0, 0, 0];
        this.maxSpeed = 3;
        this.friction = 0.2;
        this.acceleration = 20;
        this.node = node;
        this.keys = new Map();
        this.mousemoveHandler = this.mousemoveHandler.bind(this);
    }
    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
    }
    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        for (let key in this.keys) {
            this.keys.set(key, false);
        }
    }
    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this.node;
        const rotationX = new Rotor(dx * this.mouseSensitivity, [1, 0, 0]);
        const rotationY = new Rotor(dy * this.mouseSensitivity, [0, 0, 1]);
        const rotation = Rotor.multiply(rotationX, rotationY);
        this.node.rotation = Rotor.multiply(this.node.rotation, rotation);
    }
}
//# sourceMappingURL=Player.js.map