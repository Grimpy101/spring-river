import Rotor from "../algebra/Rotor.js";
import Vector3 from "../algebra/Vector3.js";
import Node from "../data/Node.js";

export default class PlayerInteraction {

    node: Node;
    keys: Map<string, boolean>;
    
    mouseSensitivity: number = 0.002;
    velocity: number[] = [0, 0, 0];
    maxSpeed: number = 3;
    friction: number = 0.2;
    acceleration: number = 20;

    constructor(node: Node) {
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

    mousemoveHandler(e: MouseEvent) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this.node;

        const rotationX = new Rotor(dx * this.mouseSensitivity, [1, 0, 0]);
        const rotationY = new Rotor(dy * this.mouseSensitivity, [0, 0, 1]);
        const rotation = Rotor.multiply(rotationX, rotationY);
        this.node.rotation = Rotor.multiply(this.node.rotation, rotation);

        //console.log(dx * this.mouseSensitivity);
        //console.log(rotationX, rotationY, rotation);
    }
}