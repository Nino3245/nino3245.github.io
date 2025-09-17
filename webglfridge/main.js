import { loadMagnets, spawnMagnet, clearMagnets } from './magnetManager.js';
import { initInput } from './inputManager.js';
import { render } from './renderManager.js';

const canvas = document.getElementById('fridgeCanvas');
const ctx = canvas.getContext('2d');

initInput(canvas);

async function start() {
    await loadMagnets();
    setupPalette();
    requestAnimationFrame(gameLoop);
}

function setupPalette() {
console.log(`Hi! Thanks for checking out WebGLFridge, feel free to look in the dev console, there's some debugging stuff, oh, and just because you're here, try editing the magnet id of one of the buttons to say "secret", bye!`)
    document.querySelectorAll('#magnetPalette button').forEach(button => {
        button.addEventListener('click', () => {
            const rect = canvas.getBoundingClientRect();
            const x = rect.width / 2;
            const y = rect.height / 2;
            spawnMagnet(button.dataset.magnet, x, y);
        });
    });
}

document.getElementById('saveButton').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'fridge.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
console.log(`Saved ;)`);
});

document.getElementById('clearButton').addEventListener('click', () => {
    clearMagnets();
console.log(`Cleared!`);
});

function gameLoop() {
    render(ctx);
    requestAnimationFrame(gameLoop);
}

start();
