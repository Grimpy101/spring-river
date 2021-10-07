export default class Rotor {

    cosa: number;
    sina_xy: number;
    sina_yz: number;
    sina_zx: number;

    constructor(angle: number, bivector: number[]) {
        let halfAngle = angle / 2;
        let sina = Math.sin(halfAngle);

        this.cosa = Math.cos(halfAngle);
        this.sina_xy = -sina * bivector[0];
        this.sina_yz = -sina * bivector[1];
        this.sina_zx = -sina * bivector[2];
    }

    static quat2rotor(quaternion: number[]) {
        const rotor = new Rotor(0, [0, 0, 0]);
        rotor.cosa = quaternion[3];
        rotor.sina_xy = quaternion[0];
        rotor.sina_yz = quaternion[1];
        rotor.sina_zx = quaternion[2];
        return rotor;
    }

    invert() {
        return Rotor.quat2rotor([
            this.cosa,
            -this.sina_xy,
            -this.sina_yz,
            -this.sina_zx
        ]);
    }
}