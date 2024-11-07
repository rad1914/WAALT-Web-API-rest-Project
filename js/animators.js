// animators.js

const titleText = "¿Qué tienes en mente?";
let index = 0;

export function typeTitle(speed = 28) {
    const writingTitle = document.getElementById('writingTitle');
    if (writingTitle) {
        if (index < titleText.length) {
            writingTitle.textContent += titleText.charAt(index++);
            setTimeout(() => typeTitle(speed), speed);
        }
    } else {
        console.error("Error: Element with ID 'writingTitle' not found.");
    }
}

export function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
