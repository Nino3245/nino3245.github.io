import { Entity } from '../Entity.js';
import { Cube } from './Cube.js';
import * as THREE from 'three';

export class Zombie extends Entity {
    constructor(level, x, y, z, material) {
        super(level);
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = material;
        
        this.timeOffs = Math.random() * 1239813.0;
        this.rot = Math.random() * Math.PI * 2.0;
        this.speed = 1.0;
        this.rotA = (Math.random() + 1.0) * 0.01;

        this.group = new THREE.Group();

        this.container = new THREE.Group();
        this.group.add(this.container);

        this.head = new Cube(0, 0);
        this.head.addBox(-4.0, -8.0, -4.0, 8, 8, 8);
        
        this.body = new Cube(16, 16);
        this.body.addBox(-4.0, 0.0, -2.0, 8, 12, 4);
        
        this.arm0 = new Cube(40, 16);
        this.arm0.addBox(-3.0, -2.0, -2.0, 4, 12, 4);
        this.arm0.setPos(-5.0, 2.0, 0.0);
        
        this.arm1 = new Cube(40, 16);
        this.arm1.addBox(-1.0, -2.0, -2.0, 4, 12, 4);
        this.arm1.setPos(5.0, 2.0, 0.0);
        
        this.leg0 = new Cube(0, 16);
        this.leg0.addBox(-2.0, 0.0, -2.0, 4, 12, 4);
        this.leg0.setPos(-2.0, 12.0, 0.0);
        
        this.leg1 = new Cube(0, 16);
        this.leg1.addBox(-2.0, 0.0, -2.0, 4, 12, 4);
        this.leg1.setPos(2.0, 12.0, 0.0);

        [this.head, this.body, this.arm0, this.arm1, this.leg0, this.leg1].forEach(part => {
            part.initMesh(this.material);
            this.container.add(part.mesh);
        });
    }

    tick() {
        this.xo = this.x; this.yo = this.y; this.zo = this.z;
        this.rot += this.rotA;
        this.rotA *= 0.99;
        this.rotA += (Math.random() - Math.random()) * Math.random() * Math.random() * 0.01;
        const xa = Math.sin(this.rot);
        const ya = Math.cos(this.rot);
        if (this.onGround && Math.random() < 0.01) this.yd = 0.12;
        this.moveRelative(xa, ya, this.onGround ? 0.02 : 0.005);
        this.yd -= 0.005;
        this.move(this.xd, this.yd, this.zd);
        this.xd *= 0.91; this.yd *= 0.98; this.zd *= 0.91;
        if (this.onGround) { this.xd *= 0.8; this.zd *= 0.8; }
    }

    render(a) {
        const time = (performance.now() / 1000) * 10.0 * this.speed + this.timeOffs;
        const size = 0.058333334;
        
        const rx = this.xo + (this.x - this.xo) * a;
        const ry = this.yo + (this.y - this.yo) * a;
        const rz = this.zo + (this.z - this.zo) * a;
        this.group.position.set(rx, ry, rz);

        this.container.scale.set(size, -size, size);

        const yy = -Math.abs(Math.sin(time * 0.6662)) * 5.0 - 23.0;
        this.container.position.y = -yy * size; 

        this.container.rotation.y = this.rot + Math.PI;

        this.head.yRot = Math.sin(time * 0.83);
        this.head.xRot = Math.sin(time) * 0.8;
        this.arm0.xRot = Math.sin(time * 0.6662 + Math.PI) * 2.0;
        this.arm0.zRot = (Math.sin(time * 0.2312) + 1.0);
        this.arm1.xRot = Math.sin(time * 0.6662) * 2.0;
        this.arm1.zRot = (Math.sin(time * 0.2812) - 1.0);
        this.leg0.xRot = Math.sin(time * 0.6662) * 1.4;
        this.leg1.xRot = Math.sin(time * 0.6662 + Math.PI) * 1.4;

        [this.head, this.body, this.arm0, this.arm1, this.leg0, this.leg1].forEach(p => p.update());
    }
}