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

function animateElement(element, { delay = 0, animationClass = 'fadeIn' } = {}) {
    if (!element) return;
    setTimeout(() => {
        element.classList.add(animationClass);
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

async function animateButtonsWithExponentialDelay(buttons, baseDelay = 80) {
    if (!buttons || buttons.length === 0) return;

    let delay = baseDelay;
    for (const button of buttons) {
        animateElement(button, { delay });
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1; // Exponential delay factor
    }
}

async function mainAnimationSequence() {
    const botImage = document.querySelector('.animate-image');
    const footer = document.querySelector('footer');

    animateElement(botImage);
    await new Promise(resolve => setTimeout(resolve, 480));

    typeTitle(36, async () => {
        const buttons = Array.from(document.querySelectorAll('.help-button'));
        await animateButtonsWithExponentialDelay(buttons);

        // Animar el footer completo después de los botones
        if (footer) {
            setTimeout(() => {
                footer.classList.add('footer-animate');
            }, 500); // Ajusta el retraso según lo necesario
        }

        isAnimationRunning = false;
        console.log("Animation sequence completed.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (isAnimationRunning) {
        console.log("Animation already running. Ignoring trigger.");
        return; // Prevent animation if it's already running
    }
    console.log("Animation sequence starting...");
    isAnimationRunning = true; // Set flag to prevent re-triggering
    mainAnimationSequence().catch(err => {
        console.error("Error in animation sequence:", err);
        isAnimationRunning = false; // Reset in case of errors
    });
});
