import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(level) {
        super(level);
        this.heightOffset = 1.62; 
        this.eyeHeight = 1.62;
        
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    tick() {
        this.xo = this.x;
        this.yo = this.y;
        this.zo = this.z;

        let xa = 0.0;
        let ya = 0.0;

        if (this.keys['KeyR']) this.resetPos();

        if (this.keys['KeyW'] || this.keys['ArrowUp']) ya--;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) ya++;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) xa--;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) xa++;

        if ((this.keys['Space']/* this is just annoying, and only needed for accuaracy  || this.keys['MetaLeft'] */) && this.onGround) {
            this.yd = 0.12;
        }

        this.moveRelative(xa, ya, this.onGround ? 0.02 : 0.005);

        this.yd -= 0.005;

        this.move(this.xd, this.yd, this.zd);

        this.xd *= 0.91;
        this.yd *= 0.98;
        this.zd *= 0.91;

        if (this.onGround) {
            this.xd *= 0.8;
            this.zd *= 0.8;
        }
    }
}