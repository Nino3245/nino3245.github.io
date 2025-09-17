import { magnets } from './magnetManager.js';

let selectedMagnet = null;
let offset = { x: 0, y: 0 };
let isDragging = false;
let dragThreshold = 5; // pixels to count as drag
let startPos = { x: 0, y: 0 };

export function initInput(canvas) {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
}

function onMouseDown(e) {
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    selectedMagnet = magnets.find(m => isMouseOverMagnet(mouseX, mouseY, m));
    if (selectedMagnet) {
        offset.x = mouseX - selectedMagnet.x;
        offset.y = mouseY - selectedMagnet.y;
        startPos = { x: mouseX, y: mouseY };
        isDragging = false;
    }
}

function onMouseMove(e) {
    if (!selectedMagnet) return;

    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if moved enough to count as dragging
    if (!isDragging) {
        const dx = mouseX - startPos.x;
        const dy = mouseY - startPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
            isDragging = true;
        }
    }

    if (isDragging) {
        selectedMagnet.x = mouseX - offset.x;
        selectedMagnet.y = mouseY - offset.y;

        if (selectedMagnet.onDrag) selectedMagnet.onDrag(selectedMagnet);
    }
}

function onMouseUp(e) {
    if (selectedMagnet && !isDragging) {
        // Only trigger edit if it was a click
        if (selectedMagnet.type === 'text') {
            const newText = prompt('Edit note text:', selectedMagnet.text);
            if (newText !== null) selectedMagnet.text = newText;
        }
        if (selectedMagnet.onClick) selectedMagnet.onClick(selectedMagnet);
    }
    selectedMagnet = null;
    isDragging = false;
}

function isMouseOverMagnet(mx, my, magnet) {
    const width = magnet.size?.width || 100;
    const height = magnet.size?.height || 100;
    return mx >= magnet.x && mx <= magnet.x + width && my >= magnet.y && my <= magnet.y + height;
}
