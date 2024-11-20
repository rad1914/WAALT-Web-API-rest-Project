import { sendMessage } from './js/messageHandler.js';
import { typeTitle } from './js/animators.js';
import { startNewChat, fetchUserIP } from './js/chat.js';
import { sendButtonMessage } from './js/buttonMessage.js';
import { handleAttach } from './js/attachHandler.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Script ejecutándose después de DOMContentLoaded");

    // 1. Initialize main animations and fetch user IP
    typeTitle();
    await fetchUserIP();

    // 2. Select important DOM elements
    const elements = {
        messageInput: document.getElementById('messageInput'),
        sendButton: document.getElementById('sendButton'),
        helpButtons: document.querySelectorAll('.button-message'),
        attachButton: document.querySelector('.attach-button'),
        newChatButton: document.querySelector('.new-chat-button'),
        welcomeSection: document.getElementById('welcomeSection')
    };

    console.log("Verificación de elementos:", elements);

    // 3. Validate critical DOM elements
    if (!elements.messageInput || !elements.sendButton || !elements.attachButton) {
        console.warn("Advertencia: Algunos elementos esenciales no se encontraron en el DOM.");
    }

    // 4. Function to show the welcome section
    function showWelcomeSection() {
        elements.welcomeSection?.classList.replace('slide-up', 'slide-down');
        console.log("Sección de bienvenida mostrada");
    }

    // 5. Setup events for new chat button and welcome section
    elements.newChatButton?.addEventListener('click', showWelcomeSection);

    // 6. Listener for the send button and Enter key to send a message
    const sendCurrentMessage = () => {
        console.log("Mensaje enviado");
        sendMessage();
    };

    elements.sendButton?.addEventListener('click', sendCurrentMessage);
    elements.messageInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendCurrentMessage();
            event.preventDefault();
        }
    });

    // 7. Listener for help buttons with validation
    elements.helpButtons.forEach(button => {
        if (!button.dataset.initialized) {
            button.dataset.initialized = 'true';
            button.addEventListener('click', () => {
                const message = button.dataset.message;
                console.log("Botón de ayuda presionado con mensaje:", message);
                if (message) sendButtonMessage(message);
                else console.warn("Advertencia: Botón de ayuda sin el atributo 'data-message'.");
            });
        }
    });

    // 8. Listener for the attach button
    elements.attachButton?.addEventListener('click', handleAttach);

    console.log("Script configurado y ejecutado.");
});
