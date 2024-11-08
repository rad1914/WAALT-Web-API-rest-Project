// utilities.js

import { addMessageToConversation } from './uiService.js';


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
 * Formats and updates the response output element with a new message.
 * @param {string} message - The message to display.
 */
export function updateResponseOutput(message) {
    const responseOutput = document.getElementById('responseOutput');
    if (responseOutput) responseOutput.innerHTML = formatText(message);
}

/**
 * Applies custom text formatting to specified syntax markers.
 * @param {string} input - The text to format.
 * @returns {string} - The formatted text.
 */
function formatText(input) {
    let formattedText = input;

    // Bold (Negrita)
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    // Italics (Cursiva)
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');

    // Strikethrough (Tachado)
    formattedText = formattedText.replace(/~(.*?)~/g, '<del>$1</del>');

    // Monospace
    formattedText = formattedText.replace(/```(.*?)```/g, '<code>$1</code>');

    return formattedText;
}

export function showLoadingMessage() {
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loadingMessage';
    loadingMessage.classList.add('bot-message', 'loading');
    document.getElementById('conversation').appendChild(loadingMessage);
}

/**
 * Removes the loading message and displays the bot's response.
 * @param {string} responseText - The bot's response.
 */
export function updateWithBotResponse(responseText) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove(); // Remove loading message
    }
  
    addMessageToConversation(formatText(responseText), 'bot');
}
