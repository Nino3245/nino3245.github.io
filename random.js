async function loadSplashes() {
    try {
        const response = await fetch('splashes.txt');
        const text = await response.text();
        const splashes = text.split('\n').filter(line => line.trim() !== "");
        const splashElement = document.querySelector('.splash');
        const randomSplash = splashes[Math.floor(Math.random() * splashes.length)];

        if (randomSplash.startsWith('http')) {
            splashElement.innerHTML = `<a href="${randomSplash}" target="_blank">${randomSplash}</a>`;
        } else {
            splashElement.textContent = randomSplash;
        }

        splashElement.style.visibility = 'visible';
    } catch (error) {
        console.error("Could not load splashes:", error);
    }
}

loadSplashes();