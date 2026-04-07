export class Tile {
    static rock = new Tile(1);
    static grass = new Tile(0);

    constructor(tex) {
        this.tex = tex;
    }

    render(meshCollector, level, x, y, z) {

        const xTex = this.tex % 16;
        const yTex = Math.floor(this.tex / 16);


        // note: textures need to be flipped, but i'll do it later
        // note note: i did it uwu
        const u1 = xTex / 16.0;
        const u0 = u1 + (0.999 / 16.0);

        const v0 = 1.0 - (yTex / 16.0) - (0.999 / 16.0); 
        const v1 = 1.0 - yTex / 16.0;

        const c1 = 1.0;
        const c2 = 0.8;
        const c3 = 0.6;

        const x0 = x, x1 = x + 1;
        const y0 = y, y1 = y + 1;
        const z0 = z, z1 = z + 1;


if (!level.isSolidTile(x, y - 1, z)) {
    let br = level.getBrightness(x, y - 1, z) * c1;
    this.addFace(meshCollector, 
        [x0, y0, z1,  x0, y0, z0,  x1, y0, z0,  x1, y0, z1], 
        [u1, v0,  u1, v1,  u0, v1,  u0, v0],
        br);
}

if (!level.isSolidTile(x, y + 1, z)) {
    let br = level.getBrightness(x, y, z) * c1;
    this.addFace(meshCollector, 
        [x1, y1, z1,  x1, y1, z0,  x0, y1, z0,  x0, y1, z1],
        [u0, v0,  u0, v1,  u1, v1,  u1, v0],
        br);
}

if (!level.isSolidTile(x, y, z - 1)) {
    let br = level.getBrightness(x, y, z - 1) * c2;
    this.addFace(meshCollector, 
        [x0, y1, z0,  x1, y1, z0,  x1, y0, z0,  x0, y0, z0],
        [u0, v1,  u1, v1,  u1, v0,  u0, v0],
        br);
}

if (!level.isSolidTile(x, y, z + 1)) {
    let br = level.getBrightness(x, y, z + 1) * c2;
    this.addFace(meshCollector, 
        [x0, y1, z1,  x0, y0, z1,  x1, y0, z1,  x1, y1, z1],
        [u1, v1,  u1, v0,  u0, v0,  u0, v1],
        br);
}

if (!level.isSolidTile(x - 1, y, z)) {
    let br = level.getBrightness(x - 1, y, z) * c3;
    this.addFace(meshCollector, 
        [x0, y1, z1,  x0, y1, z0,  x0, y0, z0,  x0, y0, z1],
        [u0, v1,  u1, v1,  u1, v0,  u0, v0],
        br);
}

if (!level.isSolidTile(x + 1, y, z)) {
    let br = level.getBrightness(x + 1, y, z) * c3;
    this.addFace(meshCollector, 
        [x1, y0, z1,  x1, y0, z0,  x1, y1, z0,  x1, y1, z1],
        [u1, v0,  u0, v0,  u0, v1,  u1, v1],
        br);
    }
}
    addFace(coll, p, uv, br) {
        this.pushVertex(coll, p[0], p[1], p[2], uv[0], uv[1], br);
        this.pushVertex(coll, p[3], p[4], p[5], uv[2], uv[3], br);
        this.pushVertex(coll, p[6], p[7], p[8], uv[4], uv[5], br);

        this.pushVertex(coll, p[0], p[1], p[2], uv[0], uv[1], br);
        this.pushVertex(coll, p[6], p[7], p[8], uv[4], uv[5], br);
        this.pushVertex(coll, p[9], p[10], p[11], uv[6], uv[7], br);
    }

    pushVertex(coll, x, y, z, u, v, br) {
        coll.positions.push(x, y, z);
        coll.uvs.push(u, v);
        coll.colors.push(br, br, br);
}
}