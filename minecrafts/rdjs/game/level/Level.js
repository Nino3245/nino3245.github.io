import { AABB } from '../phys/AABB.js';

export class Level {
    constructor(w, h, d) {
        this.width = w;
        this.height = h;
        this.depth = d;
        
        this.blocks = new Uint8Array(w * h * d);
        
        this.lightDepths = new Int32Array(w * h);
        this.levelListeners = [];

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < d; y++) {
                for (let z = 0; z < h; z++) {
                    let i = (y * h + z) * w + x;
                    this.blocks[i] = (y <= d * 2 / 3) ? 1 : 0;
                }
            }
        }

        this.calcLightDepths(0, 0, w, h);
    }

    calcLightDepths(x0, z0, x1, z1) {
        for (let x = x0; x < x0 + x1; x++) {
            for (let z = z0; z < z0 + z1; z++) {
                let oldDepth = this.lightDepths[x + z * this.width];
                let y = this.depth - 1;
                
                while (y > 0 && !this.isLightBlocker(x, y, z)) {
                    y--;
                }

                this.lightDepths[x + z * this.width] = y;

                if (oldDepth !== y) {
                    let yl0 = Math.min(oldDepth, y);
                    let yl1 = Math.max(oldDepth, y);

                    for (let i = 0; i < this.levelListeners.length; i++) {
                        this.levelListeners[i].lightColumnChanged(x, z, yl0, yl1);
                    }
                }
            }
        }
    }

    addListener(levelListener) {
        this.levelListeners.push(levelListener);
    }

    removeListener(levelListener) {
        this.levelListeners = this.levelListeners.filter(l => l !== levelListener);
    }

async save() {
    try {
        console.log("Saving level...");
        const blob = new Blob([this.blocks]);
        const compressionStream = new CompressionStream('gzip');
        const compressedStream = blob.stream().pipeThrough(compressionStream);
        
        const response = new Response(compressedStream);
        const compressedBuffer = await response.arrayBuffer();
        
        const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)));
        localStorage.setItem('level_data', base64);
        
        console.log("Saved successfully to LocalStorage!");
    } catch (e) {
        console.error("Failed to save:", e);
    }
}

async load() {
    try {
        const base64 = localStorage.getItem('level_data');
        if (!base64) return console.log("No save file found.");

        console.log("Loading level...");

        const compressedData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        

        const decompressionStream = new DecompressionStream('gzip');
        const stream = new Blob([compressedData]).stream().pipeThrough(decompressionStream);
        
        const response = new Response(stream);
        const decompressedBuffer = await response.arrayBuffer();
        

        this.blocks.set(new Uint8Array(decompressedBuffer));
        
        this.calcLightDepths(0, 0, this.width, this.height);
        
        this.levelListeners.forEach(l => l.allChanged());
        
        console.log("Level loaded!");
    } catch (e) {
        console.error("Failed to load:", e);
    }
}

    isTile(x, y, z) {
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return false;
        }
        return this.blocks[(y * this.height + z) * this.width + x] === 1;
    }

    isSolidTile(x, y, z) {
        return this.isTile(x, y, z);
    }

    isLightBlocker(x, y, z) {
        return this.isSolidTile(x, y, z);
    }

    getCubes(aabb) {
        const aabbs = [];
        let x0 = Math.floor(aabb.x0);
        let x1 = Math.floor(aabb.x1 + 1.0);
        let y0 = Math.floor(aabb.y0);
        let y1 = Math.floor(aabb.y1 + 1.0);
        let z0 = Math.floor(aabb.z0);
        let z1 = Math.floor(aabb.z1 + 1.0);

        x0 = Math.max(0, x0);
        y0 = Math.max(0, y0);
        z0 = Math.max(0, z0);
        x1 = Math.min(this.width, x1);
        y1 = Math.min(this.depth, y1);
        z1 = Math.min(this.height, z1);

        for (let x = x0; x < x1; x++) {
            for (let y = y0; y < y1; y++) {
                for (let z = z0; z < z1; z++) {
                    if (this.isSolidTile(x, y, z)) {
                        aabbs.push(new AABB(x, y, z, x + 1, y + 1, z + 1));
                    }
                }
            }
        }
        return aabbs;
    }

    getBrightness(x, y, z) {
        const dark = 0.8;
        const light = 1.0;
        if (x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.depth || z >= this.height) {
            return light;
        }
        return (y < this.lightDepths[x + z * this.width]) ? dark : light;
    }

    setTile(x, y, z, type) {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.depth && z < this.height) {
            this.blocks[(y * this.height + z) * this.width + x] = type;
            this.calcLightDepths(x, z, 1, 1);

            for (let i = 0; i < this.levelListeners.length; i++) {
                this.levelListeners[i].tileChanged(x, y, z);
            }
        }
    }
}