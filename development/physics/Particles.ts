import Mesh from '../data/Mesh.js'
import Particle from './Particle.js';
import { vec3 } from '../external_libraries/glMatrix/index.js';

export default class Particles {

    mesh: Mesh[];
    emitter: any[];
    lifetime: number;
    particles: Particle[];
    gravity: any;
    particle_limit: number;
    default_velocity: any;

    constructor(mesh: Mesh[], emitter: any[], lifetime: number, gravity: any, default_velocity: any) {
        this.mesh = mesh;
        this.emitter = emitter;
        this.lifetime = lifetime;
        this.particles = [];
        this.gravity = gravity;
        this.default_velocity = vec3.clone(default_velocity);
    }

    generate_particle_position() {
        return vec3.fromValues(
            Math.random() * (this.emitter[0][0] - this.emitter[1][0]) + this.emitter[1][0],
            Math.random() * (this.emitter[0][1] - this.emitter[1][1]) + this.emitter[1][1],
            Math.random() * (this.emitter[0][2] - this.emitter[1][2]) + this.emitter[1][2]
        );
    }

    generate_new_particle(type: string = 'random') {
        if (type === 'random') {
            let particlePosition = this.generate_particle_position();
            const particle = new Particle(
                particlePosition,
                this.mesh[Math.random() * (this.mesh.length - 1)],
                vec3.clone(this.default_velocity)
            );
            return particle;
        }
        return null;
    }

    resetParticle(particle: Particle) {
        particle.velocity = vec3.clone(this.default_velocity);
        particle.timeSinceBirth = 0;
        particle.location = this.generate_particle_position();
    }

    updateParticle(particle: Particle, td: number) {
        const dVelocity = vec3.create();
        vec3.scale(dVelocity, this.gravity, td);
        vec3.add(particle.velocity, particle.velocity, dVelocity);
        
        const dPosition = vec3.create();
        vec3.scale(dPosition, particle.velocity, td);
        vec3.add(particle.location, particle.location, dPosition);
    }

    particle_state(td: number, stateFunc?: Function) {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.timeSinceBirth > this.lifetime) {
                this.resetParticle(particle);
            } else {
                this.updateParticle(particle, td);
            }
        }

        if (this.particles.length < this.particle_limit) {
            const particle = this.generate_new_particle();
            this.particles.push(particle);
        }
    }
}