// animators.js

const titleText = "¿Qué tienes en mente?";
let index = 0;

/**
 * Types the title text letter by letter.
 */
export function typeTitle(speed = 28) {
    const writingTitle = document.getElementById('writingTitle');
    if (writingTitle && index < titleText.length) {
        writingTitle.textContent += titleText.charAt(index);
        index++;
        setTimeout(() => typeTitle(speed), speed);
    } else if (!writingTitle) {
        console.error("Error: Element with ID 'writingTitle' not found.");
    }
}

export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Message sending function
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        const message = messageInput.value.trim();
        if (message) {
            console.log("Message sent:", message); // Placeholder for sending logic
            messageInput.value = ''; // Clear input after sending
        }
    } else {
        console.error("Error: Element with ID 'messageInput' not found.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll('.animate-button');
    const image = document.querySelector('.animate-image');
    const inputField = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    if (inputField) {
        inputField.addEventListener('keydown', debounce(sendMessage, 300));
        inputField.classList.add('fadeInInput');
        setTimeout(() => inputField.classList.remove('fadeInInput'), 1000);
    } else {
        console.error("Error: Element with ID 'messageInput' not found.");
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (image) {
        image.classList.add('fadeInImage');
    } else {
        console.warn("Warning: Element with class 'animate-image' not found.");
    }

    buttons.forEach((button, idx) => {
        setTimeout(() => button.classList.add('fadeInButton'), idx * 200);
    });

    setTimeout(() => typeTitle(), 500);
});
