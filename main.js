// **main.js
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
    const sendButton = document.getElementById('sendButton'); // This should be the one in the message bar

    if (!messageInput || !sendButton) {
        console.error("Required elements not found in the DOM");
        return; // Exit early if essential elements are missing
    }

    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
            event.preventDefault();
        }
    });

    sendButton.addEventListener('click', () => {
        sendMessage();
    });
});
