import { CONFIG } from './config.js';

// add /dev to the end of the URL

export let magnets = [];
let magnetDefinitions = [];

export async function loadMagnets() {
    try {
        const response = await fetch('./magnets/magnets.json?nocache=' + Date.now());
        magnetDefinitions = await response.json();
    } catch (err) {
        console.error('Failed to load magnets:', err);
    }
}

export async function addMagnet(magnetData, x = null, y = null) {
    const magnet = {
        ...magnetData,
        x: x !== null ? x : magnetData.position?.x || 0,
        y: y !== null ? y : magnetData.position?.y || 0,
        rotation: magnetData.rotation || 0,
        onDrag: magnetData.onDrag || null,
        onClick: magnetData.onClick || null
    };

    // If it's an image magnet, preload the image ONCE and keep it
    // this code is just a result of me accidentally clicking a box, it's not necessary now,
    if (magnet.type === 'image') {
        if (!magnet.img) {
            magnet.img = new Image();
            magnet.img.src = magnet.src;
        }
    }

    magnets.push(magnet);
    return magnet;
}

export function spawnMagnet(magnetId, x = 100, y = 100) {
    const magnetData = magnetDefinitions.find(m => m.id === magnetId);
        console.log(`Spawned Magnet with ID "${magnetId}"`);
    if (!magnetData) {
        console.warn(`Magnet with ID "${magnetId}" not found`);
        return null;
    }

    // Ensure cloned magnets also get their image cached
    const clone = { ...magnetData };
    return addMagnet(clone, x, y);
}

export function removeMagnet(magnet) {
    if (typeof magnet === 'string') {
//        console.log(`Cleared fridge ;)`);
        magnets = magnets.filter(m => m.id !== magnet);
    } else {
//        console.log(`Cleared fridge ;)`);
        magnets = magnets.filter(m => m !== magnet);
    }
}

export function clearMagnets() {
    magnets = [];
}
