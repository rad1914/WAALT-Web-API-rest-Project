// main.js


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

    // 4. Generic function to add event listeners with validation
    function addListener(element, event, callback, logMessage) {
        if (element) {
            element.addEventListener(event, callback);
            if (logMessage) console.log(logMessage);
        } else {
            console.warn(`Advertencia: Elemento faltante para evento '${event}'.`);
        }
    }

    // 5. Show welcome section
    const showWelcomeSection = () => {
        elements.welcomeSection?.classList.replace('slide-up', 'slide-down');
        console.log("Sección de bienvenida mostrada");
    };

    // 6. Send current message
    const sendCurrentMessage = () => {
        console.log("Mensaje enviado");
        sendMessage();
    };

    // 7. Add listeners to buttons
    addListener(elements.newChatButton, 'click', showWelcomeSection, "Botón de nueva conversación configurado.");
    addListener(elements.sendButton, 'click', sendCurrentMessage, "Botón de enviar mensaje configurado.");
    addListener(elements.attachButton, 'click', handleAttach, "Botón de adjuntar configurado.");

    // 8. Prevent message sending with Enter
    addListener(elements.messageInput, 'keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            console.log("Enter presionado sin enviar mensaje.");
        }
    });

    // 9. Setup help buttons
    elements.helpButtons.forEach(button => {
        if (!button.dataset.initialized) {
            button.dataset.initialized = 'true';
            button.addEventListener('click', () => {
                const message = button.dataset.message;
                if (message) {
                    console.log("Botón de ayuda presionado con mensaje:", message);
                    sendButtonMessage(message);
                } else {
                    console.warn("Advertencia: Botón de ayuda sin el atributo 'data-message'.");
                }
            });
        }
    });

    console.log("Script configurado y ejecutado.");
});
