import { magnets } from './magnetManager.js';

/**
 * Helper: Draw text with word wrap
 */
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxHeight) {
    let line = '';
    let currentY = y;

    for (let i = 0; i < text.length; i++) {
        const testLine = line + text[i];
        const metrics = ctx.measureText(testLine);

        // If too wide OR over ~9 chars, wrap
        if ((metrics.width > maxWidth && line.length > 0) || line.length >= 9) {
            ctx.fillText(line, x, currentY);
            line = text[i]; // start new line with current char
            currentY += lineHeight;
        } else {
            line = testLine;
        }

        // Stop drawing if we overflow note height
        if (currentY > y + maxHeight - lineHeight) return;
    }

    // Draw last line
    if (line) ctx.fillText(line, x, currentY);
}

/**
 * Helper: Draw rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

export function render(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const magnet of magnets) {
        ctx.save();

        // subtle drop shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        if (magnet.type === 'image') {
            // Use cached preloaded image
            if (magnet.img && magnet.img.complete) {
                ctx.drawImage(magnet.img, magnet.x, magnet.y, magnet.size.width, magnet.size.height);
            }
        } else if (magnet.type === 'text') {
            const width = magnet.size.width || 100;
            const height = magnet.size.height || 100;
            const padding = 6;
            const radius = 8;

            // sticky note background with rounded corners
            ctx.fillStyle = '#fffa70';
            drawRoundedRect(ctx, magnet.x, magnet.y, width, height, radius);

            // draw wrapped text
            ctx.fillStyle = '#000';
            const fontSize = Math.min(16, height * 0.5);
            ctx.font = `${fontSize}px Arial`;
            ctx.textBaseline = 'top';
            const lineHeight = fontSize * 1.2;
            drawWrappedText(
                ctx,
                magnet.text,
                magnet.x + padding,
                magnet.y + padding,
                width - padding * 2,
                lineHeight,
                height - padding * 2 // make sure text doesn't overflow sticky note
            );
        }

        ctx.restore();
    }
}
