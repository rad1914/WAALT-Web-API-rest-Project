// animators.js

const titleText = "¿Qué tienes en mente?";
let index = 0;

export function typeTitle(speed = 30) {
    const writingTitle = document.getElementById('writingTitle');
    if (!writingTitle) {
        console.error("Error: Element with ID 'writingTitle' not found.");
        return;
    }
   

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
                el.forEach((element, idx) => setTimeout(() => {
                    if (!element.classList.contains(animationClass)) {
                        element.classList.add(animationClass);
                    }
                }, idx * 200));
            } else {
                if (!el.classList.contains(animationClass)) {
                    el.classList.add(animationClass);
                }
            }
        } else {
            console.warn(`Warning: ${animationClass} element not found.`);
        }
    });

    setTimeout(typeTitle, 600);
});
