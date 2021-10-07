import Rotor from "./Rotor";

export default class Vector3 {

    x: number;
    y: number;
    z: number;

    constructor(arr: number[]) {
        this.x = arr[0];
        this.y = arr[1];
        this.z = arr[2];
    }

    toArray() {
        return [
            this.x,
            this.y,
            this.z
        ];
    }

    clone() {
        return new Vector3(this.toArray());
    }

    static add(vector1: Vector3, vector2: Vector3) {
        return new Vector3([
            vector1.x + vector2.x,
            vector1.y + vector2.y,
            vector1.z + vector2.z
        ]);
    }

    static subtract(vector1: Vector3, vector2: Vector3) {
        return new Vector3([
            vector1.x - vector2.x,
            vector1.y - vector2.y,
            vector1.z - vector2.z
        ]);
    }

    static scale(vector: Vector3, scale_vector: Vector3) {
        return new Vector3([
            vector.x * scale_vector.x,
            vector.y * scale_vector.y,
            vector.z * scale_vector.z
        ]);
    }

    static rotate(v: Vector3, r: Rotor) {
        const q = new Vector3([
            r.cosa * v.x + r.sina_xy * v.y + r.sina_zx * v.z,
            r.cosa * v.y + r.sina_xy * v.x + r.sina_yz * v.z,
            r.cosa * v.z + r.sina_zx * v.x + r.sina_yz * v.y
        ]);
        const xyz = r.sina_yz * v.x - r.sina_zx * v.y + r.sina_xy * v.z;
        const newVector = new Vector3([
            r.cosa * q.x + r.sina_xy * q.y + r.sina_zx * q.z + r.sina_yz * xyz,
            r.cosa * q.y - r.sina_xy * q.x - r.sina_zx * xyz + r.sina_yz * q.z,
            r.cosa * q.z + r.sina_xy * xyz - r.sina_zx * q.x - r.sina_yz * q.y
        ]);
        return newVector;
    }
}