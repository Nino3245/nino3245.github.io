import * as THREE from 'three';

export class Cube {
    constructor(xTexOffs, yTexOffs) {
        this.xTexOffs = xTexOffs;
        this.yTexOffs = yTexOffs;
        this.x = 0; this.y = 0; this.z = 0;
        this.xRot = 0; this.yRot = 0; this.zRot = 0;
        
        this.geometry = new THREE.BufferGeometry();
    }

    setPos(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

addBox(x0, y0, z0, w, h, d) {
        const x1 = x0 + w;
        const y1 = y0 + h;
        const z1 = z0 + d;

        const v = [
            [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
            [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]
        ];

const faces = [
    [[5, 1, 2, 6], this.xTexOffs + d + w,     this.yTexOffs + d,     this.xTexOffs + d + w + d,     this.yTexOffs + d + h], 
    [[0, 4, 7, 3], this.xTexOffs + 0,         this.yTexOffs + d,     this.xTexOffs + d,             this.yTexOffs + d + h], 
    [[5, 4, 0, 1], this.xTexOffs + d,         this.yTexOffs + 0,     this.xTexOffs + d + w,         this.yTexOffs + d],     
    [[2, 3, 7, 6], this.xTexOffs + d + w,     this.yTexOffs + 0,     this.xTexOffs + d + w + w,     this.yTexOffs + d],     
    [[1, 0, 3, 2], this.xTexOffs + d,         this.yTexOffs + d,     this.xTexOffs + d + w,         this.yTexOffs + d + h], 
    [[4, 5, 6, 7], this.xTexOffs + d + w + d, this.yTexOffs + d,     this.xTexOffs + d + w + d + w, this.yTexOffs + d + h]  
];

        const positions = []; 
        const uvs = [];

faces.forEach((face, index) => {
    const [indices, u0, v0, u1, v1] = face;
    
    const uu0 = u0 / 64.0;
    const vv0 = v0 / 32.0;
    const uu1 = u1 / 64.0;
    const vv1 = v1 / 32.0;

    const vTop = 1.0 - vv0;
    const vBottom = 1.0 - vv1;

    const quad = [0, 1, 2, 3]; 
    const triangleIndices = [0, 1, 2, 0, 2, 3];

    triangleIndices.forEach(i => {
        const idx = indices[i];
        positions.push(...v[idx]);
        
        if (index === 2 || index === 3) {
            if (i === 0) uvs.push(uu1, vBottom);
            if (i === 1) uvs.push(uu0, vBottom);
            if (i === 2) uvs.push(uu0, vTop);
            if (i === 3) uvs.push(uu1, vTop);
        } else {
            if (i === 0) uvs.push(uu1, vTop);
            if (i === 1) uvs.push(uu0, vTop);
            if (i === 2) uvs.push(uu0, vBottom);
            if (i === 3) uvs.push(uu1, vBottom);
        }
    });
});

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }

initMesh(material) {
    this.mesh = new THREE.Mesh(this.geometry, material);
}

update() {
    if (!this.mesh) return;
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.set(this.xRot, this.yRot, this.zRot, 'ZYX');
}

    render(scene, material) {
        if (!this.mesh) {
            this.mesh = new THREE.Mesh(this.geometry, material);
            scene.add(this.mesh);
        }
        
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.rotation.set(this.xRot, this.yRot, this.zRot, 'ZYX');
    }
}