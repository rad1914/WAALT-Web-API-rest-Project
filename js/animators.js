// animators.js

const titleText = "✦ ¿Qué tienes en mente?";
let index = 0;
let isAnimationRunning = false;

export function typeTitle(speed = 36, onComplete = null) {
    const writingTitle = document.getElementById('writingTitle');
    if (!writingTitle) return;
    index = 0;
    writingTitle.textContent = "";

    const type = () => {
        if (index < titleText.length) {
            writingTitle.textContent += titleText.charAt(index++);
            setTimeout(type, speed);
        } else if (onComplete) {
            onComplete();
        }
    };
    type();
}

async function animateElement(elements, { delay = 0, animationClass = 'fadeIn', exponential = false } = {}) {
    if (!elements) return;
    if (!Array.isArray(elements)) elements = [elements]; // Normalize single element to array

    for (const element of elements) {
        if (!element) continue;
        setTimeout(() => {
            element.classList.add(animationClass);
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);

        if (exponential) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Adjust the delay multiplier as needed
        }
    }
}

async function mainAnimationSequence() {
    const botImage = document.querySelector('.animate-image');
    const footer = document.querySelector('footer');
    const buttons = Array.from(document.querySelectorAll('.help-button'));

    await animateElement(botImage, { delay: 0 });
    await new Promise(resolve => setTimeout(resolve, 480));

    typeTitle(36, async () => {
        await animateElement(buttons, { delay: 80, exponential: true });

        if (footer) {
            setTimeout(() => {
                footer.classList.add('footer-animate');
            }, 500);
        }

        isAnimationRunning = false;
        console.log("Animation sequence completed.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (isAnimationRunning) {
        console.log("Animation already running. Ignoring trigger.");
        return;
    }
    console.log("Animation sequence starting...");
    isAnimationRunning = true;
    mainAnimationSequence().catch(err => {
        console.error("Error in animation sequence:", err);
        isAnimationRunning = false;
    });
});
