let userIP = null;

/**
 * Fetches the user's IP address from an external API.
 * @returns {Promise<void>}
 */
export async function fetchUserIP() {
    if (userIP) {
        console.log("User IP (cached):", userIP);
        return;
    }
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Error fetching IP');
        
        const data = await response.json();
        userIP = data.ip;
        console.log("User IP:", userIP);
    } catch (error) {
        console.error('Failed to fetch IP address:', error);
        document.getElementById('responseOutput').innerText = 'Error: Unable to fetch IP address.';
    }
}

/**
 * Starts a new chat session by clearing previous conversation and resetting UI elements.
 */
export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const welcomeSection = document.getElementById('welcomeSection');
    const newChatButton = document.querySelector('.new-chat-button');
    const messageInput = document.getElementById('messageInput');

    // Limpiar el área de conversación y ocultar la sección de bienvenida con animación
    if (conversation) {
        conversation.innerHTML = '';
        console.log("Conversation area cleared.");
    }

    if (responseOutput) {
        responseOutput.innerText = '';
        console.log("Response output cleared.");
    }

    if (welcomeSection) {
        // Ocultar la sección de bienvenida al iniciar nueva conversación
        welcomeSection.classList.remove('slide-down');
        welcomeSection.classList.add('slide-up');
    }

    if (newChatButton) {
        newChatButton.classList.add('show-button');
    }

    if (messageInput) {
        messageInput.value = '';
    }

    // Limpiar sessionStorage y otros datos de sesión
    sessionStorage.clear();
    console.log("Session data cleared.");
}

// Ocultar el botón de nueva conversación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const newChatButton = document.querySelector('.new-chat-button');
    if (newChatButton) {
        newChatButton.classList.remove('show-button');
    }
});

/**
 * Send a message, hide welcome section, and show new chat button
 */
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    const helpButtons = document.querySelectorAll('.help-button');

    if (!message) return;

    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true; 

    // Deshabilitar botones de ayuda
    helpButtons.forEach(button => button.disabled = true);

    messageInput.value = '';
    addMessageToConversation(message, 'user');

    showLoadingMessage();

    try {
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);

        if (responseText) {
            updateWithBotResponse(responseText);
        } else {
            updateWithBotResponse('Error: Respuesta no recibida. Inténtalo más tarde.');
        }
    } catch (error) {
        updateWithBotResponse('Error: No se pudo enviar el mensaje. Inténtalo más tarde.');
    } finally {
        sendButton.disabled = false; 
        helpButtons.forEach(button => button.disabled = false); // Habilitar botones de ayuda
    }

    // Ocultar la sección de bienvenida y hacer fullscreen la conversación
    const welcomeSection = document.getElementById('welcomeSection');
    const newChatButton = document.querySelector('.new-chat-button');

    if (welcomeSection) {
        welcomeSection.classList.remove('slide-down');
        welcomeSection.classList.add('slide-up');
    }
    if (newChatButton) {
        newChatButton.classList.add('show-button');
    }
}

// Mostrar la sección de bienvenida cuando el botón de nueva conversación es presionado
document.querySelector('.new-chat-button').addEventListener('click', () => {
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.classList.remove('slide-up');
        welcomeSection.classList.add('slide-down');
    }
    document.querySelector('.new-chat-button').classList.remove('show-button');
});
