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

    messageInput.addEventListener('keydown', (event) => {
        // Disable sending message with Enter key
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });

    sendButton.addEventListener('click', handleSendMessage);
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
