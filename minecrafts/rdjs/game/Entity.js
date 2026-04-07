import { AABB } from './phys/AABB.js';

export class Entity {
    constructor(level) {
this.level = level;
    this.x = 0; this.y = 0; this.z = 0;
    this.xo = 0; this.yo = 0; this.zo = 0;
    this.xd = 0; this.yd = 0; this.zd = 0;
    this.xRot = 0; this.yRot = 0;           
    this.onGround = false;
    this.heightOffset = 0;
    this.bb = new AABB(0,0,0,0,0,0);
    this.resetPos();
    }

    resetPos() {
        const x = Math.random() * this.level.width;
        const y = this.level.depth + 10;
        const z = Math.random() * this.level.height;
        this.setPos(x, y, z);
    }

setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    const w = 0.3;
    const h = 0.9;
    this.bb = new AABB(x - w, y - h, z - w, x + w, y + h, z + w);
}

    turn(xo, yo) {
        this.yRot = this.yRot + xo * 0.15;
        this.xRot = this.xRot - yo * 0.15;
        
        if (this.xRot < -90.0) this.xRot = -90.0;
        if (this.xRot > 90.0) this.xRot = 90.0;
    }

    tick() {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;
    }

    move(xa, ya, za) {
        const xaOrg = xa;
        const yaOrg = ya;
        const zaOrg = za;

        const aabbs = this.level.getCubes(this.bb.expand(xa, ya, za));

        for (let i = 0; i < aabbs.length; i++) {
            ya = aabbs[i].clipYCollide(this.bb, ya);
        }
        this.bb.move(0.0, ya, 0.0);

        for (let i = 0; i < aabbs.length; i++) {
            xa = aabbs[i].clipXCollide(this.bb, xa);
        }
        this.bb.move(xa, 0.0, 0.0);

        for (let i = 0; i < aabbs.length; i++) {
            za = aabbs[i].clipZCollide(this.bb, za);
        }
        this.bb.move(0.0, 0.0, za);

this.onGround = yaOrg != ya && yaOrg < 0.0;

    if (xaOrg != xa) this.xd = 0.0;
    if (yaOrg != ya) this.yd = 0.0;
    if (zaOrg != za) this.zd = 0.0;

    this.x = (this.bb.x0 + this.bb.x1) / 2.0;
    this.y = (this.bb.y0 + this.bb.y1) / 2.0;
    this.z = (this.bb.z0 + this.bb.z1) / 2.0;

    }

    moveRelative(xa, za, speed) {
let dist = xa * xa + za * za;
    if (dist < 0.01) return;

    dist = speed / Math.sqrt(dist);
    xa *= dist;
    za *= dist;

    const sin = Math.sin((this.yRot || 0) * Math.PI / 180.0);
    const cos = Math.cos((this.yRot || 0) * Math.PI / 180.0);

    this.xd += xa * cos - za * sin;
    this.zd += za * cos + xa * sin;
        }
    }
