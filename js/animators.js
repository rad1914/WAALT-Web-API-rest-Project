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

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");

    const elementsToAnimate = [
        { el: document.querySelector('.animate-image'), class: 'fadeInImage' },
        { el: document.getElementById('messageInput'), class: 'fadeInInput' },
        { el: document.querySelectorAll('.animate-button'), class: 'fadeInButton' }
    ];

    elementsToAnimate.forEach(({ el, class: animationClass }) => {
        if (el && el.length !== 0) {
            if (el instanceof NodeList) {
                el.forEach((element, idx) => setTimeout(() => element.classList.add(animationClass), idx * 200));
            } else {
                el.classList.add(animationClass);
                if (animationClass === 'fadeInInput') {
                    setTimeout(() => el.classList.remove(animationClass), 1000); // Only remove for input
                }
            }
        } else {
            console.warn(`Warning: ${animationClass} element not found.`);
        }
    });

    setTimeout(typeTitle, 500);
});
