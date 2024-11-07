// animators.js

const titleText = "¿Qué tienes en mente?";
let index = 0;

export function typeTitle(speed = 28) {
    const writingTitle = document.getElementById('writingTitle');
    if (!writingTitle) {
        console.error("Error: Element with ID 'writingTitle' not found.");
        return;
    }
    
    // Reset the text content and index to re-run animation
    writingTitle.textContent = '';
    index = 0;

    const type = () => {
        if (index < titleText.length) {
            writingTitle.textContent += titleText.charAt(index++);
            setTimeout(type, speed);
        }
    };
    type();
}


export function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
