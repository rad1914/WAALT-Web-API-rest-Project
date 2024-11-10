// main.js

import { sendMessage } from './js/messageHandler.js';
import { typeTitle } from './js/animators.js';
import { startNewChat, fetchUserIP } from './js/chat.js';
import { sendButtonMessage } from './js/buttonMessage.js';
import { handleAttach } from './js/attachHandler.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Script ejecutándose después de DOMContentLoaded");

    // Inicializa las animaciones y funciones principales
    typeTitle();
    await fetchUserIP();

    // Selecciona elementos importantes del DOM
    const elements = {
        messageInput: document.getElementById('messageInput'),
        sendButton: document.getElementById('sendButton'),
        helpButtons: document.querySelectorAll('.button-message'),
        attachButton: document.querySelector('.attach-button'),
        newChatButton: document.querySelector('.new-chat-button'),
        welcomeSection: document.getElementById('welcomeSection')
    };

    console.log("Verificación de elementos:", elements);

    // Validación de existencia de elementos críticos en el DOM
    if (!elements.messageInput || !elements.sendButton || !elements.attachButton) {
        console.warn("Advertencia: Algunos elementos esenciales no se encontraron en el DOM.");
    }

    // Función para mostrar la sección de bienvenida
    function showWelcomeSection() {
        elements.welcomeSection?.classList.replace('slide-up', 'slide-down');
        console.log("Sección de bienvenida mostrada");
    }

    // Configurar eventos de nueva conversación y bienvenida
    elements.newChatButton?.addEventListener('click', showWelcomeSection);

    // Listener del botón de envío y tecla Enter para enviar mensaje
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

    // Listener para los botones de ayuda (con validación de inicialización)
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

    // Listener para el botón de adjuntar
    elements.attachButton?.addEventListener('click', handleAttach);

    console.log("Script configurado y ejecutado.");
});
