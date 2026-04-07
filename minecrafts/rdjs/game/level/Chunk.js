import * as THREE from 'three';
import { AABB } from '../phys/AABB.js';
import { Tile } from './Tile.js';

export class Chunk {
    static rebuiltThisFrame = 0;
    static updates = 0;

    constructor(level, x0, y0, z0, x1, y1, z1, scene, material) {
        this.level = level;
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        
        this.aabb = new AABB(x0, y0, z0, x1, y1, z1);
        this.dirty = true;

        this.scene = scene;
        this.material = material;
        this.mesh = null;
    }

    rebuild() {
        if (Chunk.rebuiltThisFrame >= 2) return;

        this.dirty = false;
        Chunk.updates++;
        Chunk.rebuiltThisFrame++;

        const meshCollector = {
            positions: [],
            uvs: [],
            colors: []
        };

        for (let x = this.x0; x < this.x1; x++) {
            for (let y = this.y0; y < this.y1; y++) {
                for (let z = this.z0; z < this.z1; z++) {
                    if (this.level.isTile(x, y, z)) {
                        const isGrass = (y === Math.floor(this.level.depth * 2 / 3));
                        const tile = isGrass ? Tile.grass : Tile.rock;
                        
                        tile.render(meshCollector, this.level, x, y, z);
                    }
                }
            }
        }

        this.updateMesh(meshCollector);
    }

    updateMesh(data) {
        if (data.positions.length === 0) {
            if (this.mesh) {
                this.scene.remove(this.mesh);
                this.mesh.geometry.dispose();
                this.mesh = null;
            }
            return;
        }

        const geometry = new THREE.BufferGeometry();
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(data.uvs, 2));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(data.colors, 3));

        if (!this.mesh) {
            this.mesh = new THREE.Mesh(geometry, this.material);
            this.scene.add(this.mesh);
        } else {
            this.mesh.geometry.dispose();
            this.mesh.geometry = geometry;
        }
    }

    render() {
        if (this.dirty) {
            this.rebuild();
        }
    }

    setDirty() {
        this.dirty = true;
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
        }
    }
}