// main.js

import { sendMessage } from './js/messageHandler.js';
import { typeTitle } from './js/animators.js';
import { startNewChat, fetchUserIP } from './js/chat.js';
import { sendButtonMessage } from './js/buttonMessage.js';

console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Script ejecutándose después de DOMContentLoaded");

    // Inicializa las animaciones y funciones principales
    typeTitle();
    await fetchUserIP();

    // Selecciona elementos importantes del DOM
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const helpButtons = document.querySelectorAll('.button-message');
    const attachButton = document.querySelector('.attach-button');
    const newChatButton = document.querySelector('.new-chat-button');

    console.log("Verificación de elementos:", { messageInput, sendButton, helpButtons, attachButton, newChatButton });

    // Listener del botón de envío
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            console.log("Botón de envío presionado");
            sendMessage();
        });
    } else {
        console.warn("El botón de envío no se encontró en el DOM.");
    }

    // Listener de la tecla Enter para enviar mensajes
    if (messageInput) {
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                console.log("Enter presionado, enviando mensaje...");
                sendMessage();
                event.preventDefault();
            }
        });
    } else {
        console.warn("El campo de entrada de mensaje no se encontró en el DOM.");
    }

    // Listener para los botones de ayuda (evitar doble mensaje con data-initialized)
    helpButtons.forEach(button => {
        if (!button.getAttribute('data-initialized')) {
            button.setAttribute('data-initialized', 'true');
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                console.log("Botón de ayuda presionado con mensaje:", message);
                if (message) {
                    sendButtonMessage(message);
                } else {
                    console.warn("Advertencia: Botón de ayuda sin el atributo 'data-message'.");
                }
            });
        }
    });

    if (attachButton) {
        attachButton.addEventListener('click', handleAttach);
        console.log("Listener de botón de adjuntar agregado.");
    } else {
        console.warn("Botón de adjuntar no encontrado en el DOM.");
    }

    // Define handleAttach function
    function handleAttach() {
        console.log("Attach button clicked. Define your file attachment logic here.");
        // Add your actual attachment logic here, such as opening a file dialog.
    }

    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            console.log("Botón de nueva conversación presionado.");
            startNewChat();
        });
    } else {
        console.warn("Botón de nueva conversación no encontrado en el DOM.");
    }

    console.log("Script configurado y ejecutado.");
});
