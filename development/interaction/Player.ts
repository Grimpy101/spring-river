import Node from "../data/Node.js";
import { quat, vec3 } from "../external_libraries/glMatrix/index.js";

export default class PlayerInteraction {

    node: Node;
    keys: {[key: string]: boolean};
    
    mouseSensitivity: number = 0.003;
    velocity: number[] = [0, 0, 0];
    maxSpeed: number = 3;
    friction: number = 0.2;
    acceleration: number = 20;

    constructor(node: Node) {
        this.node = node;
        this.keys = {};

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    keyDownHandler(e: KeyboardEvent) {
        let key = e.code;
        this.keys[key] = true;
    }

    keyUpHandler(e: KeyboardEvent) {
        let key = e.code;
        this.keys[key] = false;
    }

    moveOnKeyAction(dt: number) {
        const c = this.node;
        const rotationEuler = this.quat2euler(c.rotation);
        const rollX = rotationEuler[2];

        const forward = vec3.set(
            vec3.create(),
            Math.sin(rollX),
            -Math.cos(rollX),
            0
        );
        
        const side = vec3.set(
            vec3.create(),
            Math.cos(rollX),
            Math.sin(rollX),
            0
        );
        
        const acceleration = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acceleration, acceleration, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acceleration, acceleration, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acceleration, acceleration, side);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acceleration, acceleration, side);
        }

        vec3.scaleAndAdd(this.velocity, this.velocity, acceleration, dt * this.acceleration);

        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA']) {
            vec3.scale(this.velocity, this.velocity, 1 - this.friction);
        }

        const len = vec3.len(this.velocity);
        if (len > this.maxSpeed) {
            vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
        }

        const velocity = vec3.clone(this.velocity);
        vec3.scaleAndAdd(c.translation, c.translation, velocity, dt);
    }

    mousemoveHandler(e: MouseEvent) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this.node;

        const pi = Math.PI;
        const twopi = pi * 2;
        const pisixth = pi/6;

        const cameraRotation = c.rotation;

        const cameraRotationEuler = this.quat2euler(cameraRotation);
        cameraRotationEuler[0] -= dy * this.mouseSensitivity;
        cameraRotationEuler[1] = 0;
        cameraRotationEuler[2] += dx * this.mouseSensitivity;
        if (cameraRotationEuler[0] < -5*pisixth) {
            cameraRotationEuler[0] = -5*pisixth;
        }
        if (cameraRotationEuler[0] > pisixth) {
            cameraRotationEuler[0] = pisixth;
        }
        cameraRotationEuler[2] = ((cameraRotationEuler[2] % twopi) + twopi) % twopi;
        c.rotation = this.euler2quat(cameraRotationEuler);
    }

    quat2euler(rot: number[]) {
        let qx = rot[0];
        let qy = rot[1];
        let qz = rot[2];
        let qw = rot[3];

        let p1 = 2 * (qw * qx + qy * qz);
        let p2 = 1 - 2 * (Math.pow(qx, 2) + Math.pow(qy, 2));
        let ox = Math.atan2(p1, p2);

        let oy = Math.asin(2 * (qw * qy - qz * qx));

        let p3 = 2 * (qw * qz + qx * qy);
        let p4 = 1 - 2 * (Math.pow(qy, 2) + Math.pow(qz, 2));
        let oz = Math.atan2(p3, p4);

        return [ox, oy, oz];
    }

    euler2quat(rot: number[]) {
        let cosx = Math.cos(rot[0]/2);
        let cosy = Math.cos(rot[1]/2);
        let cosz = Math.cos(rot[2]/2);
        let sinx = Math.sin(rot[0]/2);
        let siny = Math.sin(rot[1]/2);
        let sinz = Math.sin(rot[2]/2);

        let w = cosx * cosy * cosz + sinx * siny * sinz;
        let x = sinx * cosy * cosz - cosx * siny * sinz;
        let y = cosx * siny * cosz + sinx * cosy * sinz;
        let z = cosx * cosy * sinz - sinx * siny * cosz;

        return [x, y, z, w];
    }
}