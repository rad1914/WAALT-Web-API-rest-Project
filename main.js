// main.js

import { performHandshakeWithFallback } from './js/apiService.js';
import { sendMessage } from './js/messageHandler.js';
import { typeTitle } from './js/animators.js';
import { startNewChat, fetchUserIP } from './js/chat.js';
import { sendButtonMessage } from './js/buttonMessage.js';
import { handleAttach } from './js/attachHandler.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Script ejecutándose después de DOMContentLoaded");

    // 1. Perform handshake with main or fallback APIs
    await performHandshakeWithFallback();
    console.log('Page loaded and handshake attempted');

    // 2. Initialize main animations and fetch user IP
    typeTitle();
    await fetchUserIP();

    // 3. Select important DOM elements
    const elements = {
        messageInput: document.getElementById('messageInput'),
        sendButton: document.getElementById('sendButton'),
        helpButtons: document.querySelectorAll('.button-message'),
        attachButton: document.querySelector('.attach-button'),
        newChatButton: document.querySelector('.new-chat-button'),
        welcomeSection: document.getElementById('welcomeSection')
    };

    console.log("Verificación de elementos:", elements);

    // 4. Validate critical DOM elements
    if (!elements.messageInput || !elements.sendButton || !elements.attachButton) {
        console.warn("Advertencia: Algunos elementos esenciales no se encontraron en el DOM.");
    }

    // 5. Function to show the welcome section
    function showWelcomeSection() {
        elements.welcomeSection?.classList.replace('slide-up', 'slide-down');
        console.log("Sección de bienvenida mostrada");
    }

    // 6. Setup events for new chat button and welcome section
    elements.newChatButton?.addEventListener('click', showWelcomeSection);

    // 7. Listener for the send button and Enter key to send a message
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

    // 8. Listener for help buttons with validation
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

    // 9. Listener for the attach button
    elements.attachButton?.addEventListener('click', handleAttach);

    console.log("Script configurado y ejecutado.");
});
