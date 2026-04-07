import * as THREE from 'three';
import { Chunk } from './Chunk.js';

export class LevelRenderer {
    constructor(level, scene, material) {
        this.CHUNK_SIZE = 16;
        this.level = level;
        this.scene = scene;
        this.material = material;

        level.addListener(this);

        this.xChunks = Math.ceil(level.width / this.CHUNK_SIZE);
        this.yChunks = Math.ceil(level.depth / this.CHUNK_SIZE);
        this.zChunks = Math.ceil(level.height / this.CHUNK_SIZE);

        this.chunks = new Array(this.xChunks * this.yChunks * this.zChunks);

        for (let x = 0; x < this.xChunks; x++) {
            for (let y = 0; y < this.yChunks; y++) {
                for (let z = 0; z < this.zChunks; z++) {
                    const x0 = x * this.CHUNK_SIZE;
                    const y0 = y * this.CHUNK_SIZE;
                    const z0 = z * this.CHUNK_SIZE;
                    const x1 = Math.min((x + 1) * this.CHUNK_SIZE, level.width);
                    const y1 = Math.min((y + 1) * this.CHUNK_SIZE, level.depth);
                    const z1 = Math.min((z + 1) * this.CHUNK_SIZE, level.height);

                    const chunkIndex = (x + y * this.xChunks) * this.zChunks + z;
                    this.chunks[chunkIndex] = new Chunk(
                        level, 
                        x0, y0, z0, 
                        x1, y1, z1, 
                        this.scene, 
                        this.material
                    );
                }
            }
        }
    }


    render(frustum) {
        Chunk.rebuiltThisFrame = 0;
        
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            
            const box = new THREE.Box3(
                new THREE.Vector3(chunk.aabb.x0, chunk.aabb.y0, chunk.aabb.z0),
                new THREE.Vector3(chunk.aabb.x1, chunk.aabb.y1, chunk.aabb.z1)
            );

            if (frustum.intersectsBox(box)) {
                chunk.render();
            }
            
            if (chunk.mesh && frustum.intersectsBox(box)) {
                chunk.mesh.visible = true;
            }
        }
    }

    setDirty(x0, y0, z0, x1, y1, z1) {
        x0 = Math.floor(x0 / this.CHUNK_SIZE);
        x1 = Math.floor(x1 / this.CHUNK_SIZE);
        y0 = Math.floor(y0 / this.CHUNK_SIZE);
        y1 = Math.floor(y1 / this.CHUNK_SIZE);
        z0 = Math.floor(z0 / this.CHUNK_SIZE);
        z1 = Math.floor(z1 / this.CHUNK_SIZE);

        x0 = Math.max(0, x0);
        y0 = Math.max(0, y0);
        z0 = Math.max(0, z0);
        x1 = Math.min(this.xChunks - 1, x1);
        y1 = Math.min(this.yChunks - 1, y1);
        z1 = Math.min(this.zChunks - 1, z1);

        for (let x = x0; x <= x1; x++) {
            for (let y = y0; y <= y1; y++) {
                for (let z = z0; z <= z1; z++) {
                    const index = (x + y * this.xChunks) * this.zChunks + z;
                    this.chunks[index].setDirty();
                }
            }
        }
    }


    tileChanged(x, y, z) {
        this.setDirty(x - 1, y - 1, z - 1, x + 1, y + 1, z + 1);
    }

    lightColumnChanged(x, z, y0, y1) {
        this.setDirty(x - 1, y0 - 1, z - 1, x + 1, y1 + 1, z + 1);
    }

    allChanged() {
        this.setDirty(0, 0, 0, this.level.width, this.level.depth, this.level.height);
    }
}