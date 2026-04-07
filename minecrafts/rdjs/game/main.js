import * as THREE from 'three';
import { Level } from './level/Level.js';
import { LevelRenderer } from './level/LevelRenderer.js';
import { Player } from './Player.js';
import { HitResult } from './HitResult.js';
import { Chunk } from './level/Chunk.js';
import { Zombie } from './character/Zombie.js';

const scene = new THREE.Scene();
const fov = 70;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(70, aspect, 0.05, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);

THREE.ColorManagement.enabled = false;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

renderer.setClearColor(new THREE.Color(0.5, 0.8, 1.0));
document.body.appendChild(renderer.domElement);

const fpsElement = document.getElementById('fps');
const posElement = document.getElementById('pos');
let frames = 0;
let lastFPSTime = performance.now();

camera.rotation.order = 'YXZ';


const loader = new THREE.TextureLoader();
const texture = loader.load('res/terrain.png');
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.colorSpace = THREE.NoColorSpace;

const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    vertexColors: true, 
    side: THREE.FrontSide,
    alphaTest: 0.5 
});

const charLoader = new THREE.TextureLoader();
const charTexture = charLoader.load('res/char.png');
charTexture.magFilter = THREE.NearestFilter;
charTexture.minFilter = THREE.NearestFilter;
charTexture.generateMipmaps = false;

const zombieMaterial = new THREE.MeshBasicMaterial({ 
    map: charTexture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    depthWrite: true
});

const zombies = [];

const levelwidth = 256
const levelheight = 256
const level = new Level(levelwidth, levelheight, 64);

await level.load()

const levelRenderer = new LevelRenderer(level, scene, material);
const player = new Player(level);
let hitResult = null;

function initZombies(level, scene) {
    console.log("Spawn function called!");
    for (let i = 0; i < 100; i++) {
        const z = new Zombie(level, 128, 40, 128, zombieMaterial);
        zombies.push(z);
        scene.add(z.group);
    }
    console.log("Zombies in array:", zombies.length);
}

initZombies(level, scene);

zombies.forEach(zombie => {
    const dist = camera.position.distanceTo(zombie.group.position);
    zombie.group.visible = dist < 64;
});

const raycaster = new THREE.Raycaster();
const mouseCenter = new THREE.Vector2(0, 0);

document.addEventListener('mousedown', (e) => {
    if (!document.pointerLockElement) {
        renderer.domElement.requestPointerLock();
        return;
    }

    if (hitResult) {
        if (e.button === 0) {
            let x = hitResult.x, y = hitResult.y, z = hitResult.z;
            if (hitResult.f === 0) y--; if (hitResult.f === 1) y++;
            if (hitResult.f === 2) z--; if (hitResult.f === 3) z++;
            if (hitResult.f === 4) x--; if (hitResult.f === 5) x++;
            level.setTile(x, y, z, 1);
        }
        if (e.button === 2 || e.button === 1) {
            level.setTile(hitResult.x, hitResult.y, hitResult.z, 0);
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        player.turn(e.movementX, -e.movementY);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        level.save();
    }
});

function tick() {
    player.tick();

    for (let i = 0; i < zombies.length; i++) {
        zombies[i].tick();
    }
}

let lastTime = performance.now();
let accumulator = 0;
const tickRate = 1000 / 60;

function animate() {
    requestAnimationFrame(animate);


    
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    accumulator += delta;

    while (accumulator >= tickRate) {
        tick();
        updatePicking();
        accumulator -= tickRate;
    }

    // reduce console spam
    // console.log(`Player Pos: ${player.x.toFixed(2)}, ${player.y.toFixed(2)}, ${player.z.toFixed(2)}`);

    const a = accumulator / tickRate;
    render(a);
    updateHUD();
}

function updatePicking() {
    raycaster.setFromCamera(mouseCenter, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0 && intersects[0].distance < 5.0) {
        const hit = intersects[0];
        const p = hit.point;
        const n = hit.face.normal;

        let ix = Math.floor(p.x - n.x * 0.1);
        let iy = Math.floor(p.y - n.y * 0.1);
        let iz = Math.floor(p.z - n.z * 0.1);

        let f = -1;
        if (n.y < -0.5) f = 0; else if (n.y > 0.5) f = 1;
        else if (n.z < -0.5) f = 2; else if (n.z > 0.5) f = 3;
        else if (n.x < -0.5) f = 4; else if (n.x > 0.5) f = 5;

        hitResult = new HitResult(ix, iy, iz, 0, f);
    } else {
        hitResult = null;
    }
}

function render(a) {

    const renderX = (player.xo + (player.x - player.xo) * a) || 0;
    const renderY = (player.yo + (player.y - player.yo) * a) || 0;
    const renderZ = (player.zo + (player.z - player.zo) * a) || 0;

    // camera fix yay!!! OwO
    const fixedY = renderY + 1.62 / 2;

    camera.position.set(renderX, fixedY, renderZ);

    
    const rx = (player.xRot || 0) * Math.PI / 180;
    const ry = (player.yRot || 0) * Math.PI / 180;
    
    camera.rotation.order = 'YXZ';
    camera.rotation.x = -rx;
    camera.rotation.y = -ry;

    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    for (let i = 0; i < zombies.length; i++) {
        zombies[i].render(a);
    }
    
    levelRenderer.render(frustum);
    renderer.render(scene, camera);
}

// hud updater
function updateHUD() {
    frames++;
    const now = performance.now();
    
    if (now >= lastFPSTime + 1000) {
        fpsElement.innerText = `FPS: ${frames}`;
        frames = 0;
        lastFPSTime = now;
    }

    const x = player.x.toFixed(2);
    const y = player.y.toFixed(2);
    const z = player.z.toFixed(2);
    posElement.innerText = `Pos: ${x}, ${y}, ${z}`;

}

animate();