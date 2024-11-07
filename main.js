import { sendMessage } from './js/messageHandler.js';
import { sendButtonMessage } from './js/buttonMessage.js';
import { typeTitle } from './js/animators.js';
import { startNewChat } from './js/chat.js';
import { addMessageToConversation } from './js/uiService.js';
import { sendMessageToServers } from './js/apiService.js';
import { updateResponseOutput } from './js/utilities.js';

// Función para formatear el mensaje para el servidor
function formatMessageForServer(message) {
    return message.startsWith('/') ? message : `.ai ${message}`;
}

// Función de adjuntar archivo (como ejemplo)
function handleAttach() {
    alert('Función de adjuntar archivo (puedes implementar la lógica aquí)');
}

// Configuración de los listeners al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const attachButton = document.getElementById('attachButton');

    // Log to confirm that elements are found
    console.log(messageInput, sendButton, attachButton);

    if (!messageInput || !sendButton) {
        console.error("Required elements not found in the DOM");
        return; // Exit early if essential elements are missing
    }

    // Set up basic event listeners to test functionality
    messageInput.addEventListener('keydown', (event) => {
        console.log("Keydown event on messageInput:", event);
        if (event.key === 'Enter') {
            console.log("Enter pressed in message input");
            sendMessage(); // Call the imported sendMessage function
            event.preventDefault();
        }
    });

    sendButton.addEventListener('click', () => {
        console.log("Send button clicked");
        sendMessage(); // Call the imported sendMessage function
    });

    // Set up button messages with logging
    document.querySelectorAll('.button-message').forEach(button => {
        button.addEventListener('click', () => {
            const message = button.getAttribute('data-message');
            console.log("Button clicked with message:", message);
            sendButtonMessage(message);
        });
    });

    // Add functionality for startNewChat
    window.startNewChat = startNewChat;

    // Type title animation (keeps the old functionality)
    typeTitle();

    // Attach file button functionality
    if (attachButton) {
        attachButton.addEventListener('click', handleAttach);
    }
});

// main.js - New added functionality

// Función de envío de mensajes
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) {
        alert('Por favor, escribe un mensaje antes de enviar.');
        return;
    }

    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;

    messageInput.value = ''; // Limpiar el input
    addMessageToConversation(message, 'user'); // Mostrar mensaje en la conversación
    updateResponseOutput("Procesando..."); // Actualizar el estado

    try {
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);

        if (responseText) {
            addMessageToConversation(responseText, 'bot');
            updateResponseOutput("Respuesta recibida con éxito");
        } else {
            updateResponseOutput('Error: Respuesta no recibida. Inténtalo más tarde.');
        }
    } catch (error) {
        console.error('Error con sendMessageToServers:', error);
        updateResponseOutput('Error: No se pudo enviar el mensaje. Inténtalo más tarde.');
    } finally {
        sendButton.disabled = false;
    }
}

// Función de adjuntar archivo (como ejemplo)
function handleAttach() {
    alert('Función de adjuntar archivo (puedes implementar la lógica aquí)');
}

// Configuración de los listeners al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    const sendButton = document.getElementById('sendButton');
    const attachButton = document.getElementById('attachButton');
    const messageInput = document.getElementById('messageInput');

    // Enviar mensaje al hacer clic en el botón de enviar
    sendButton.addEventListener('click', sendMessage);

    // Adjuntar archivo al hacer clic en el botón de adjuntar
    attachButton.addEventListener('click', handleAttach);

    // También se podría deshabilitar el envío con la tecla Enter
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita el envío con Enter
        }
    });
});
