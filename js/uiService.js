// uiService.js
export function addMessageToConversation(content, type = 'bot') {
    const conversation = document.getElementById('conversation');
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', type);
    messageElem.textContent = content;
    conversation.appendChild(messageElem);
    conversation.scrollTop = conversation.scrollHeight;
}


export function setupEventListeners(handleSendMessage) {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // Deshabilitar envío de mensaje con tecla Enter
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });

    // Solo enviar mensaje cuando se hace clic en el botón de enviar
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            handleSendMessage(); // Llamar a la función de envío solo si hay contenido
        } else {
            alert('Por favor, escribe un mensaje antes de enviar.');
        }
    });
}



/**
 * Clears the content of the specified element.
 * @param {string} id - The ID of the element to clear.
 */
export function clearElementContent(id) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
}

/**
 * Toggles the display style of the specified element.
 * @param {string} id - The ID of the element to toggle.
 * @param {string} displayStyle - The display style to set (default is 'block').
 */
export function toggleElementDisplay(id, displayStyle = 'block') {
    const element = document.getElementById(id);
    if (element) element.style.display = displayStyle;
}

/**
 * Updates the response output element with a new message.
 * @param {string} message - The message to display.
 */
export function updateResponseOutput(message) {
    const responseOutput = document.getElementById('responseOutput');
    if (responseOutput) responseOutput.innerText = message;
}
