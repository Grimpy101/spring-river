import Mesh from '../data/Mesh.js'
import { vec3 } from '../external_libraries/glMatrix/index.js';

export default class Particle {

    location: any;
    mesh: Mesh;
    velocity: any;
    timeSinceBirth: number;

    constructor(location: any, mesh: Mesh, velocity: any) {
        this.location = location;
        this.mesh = mesh;
        this.velocity = velocity;
        this.timeSinceBirth = 0;
    }


}