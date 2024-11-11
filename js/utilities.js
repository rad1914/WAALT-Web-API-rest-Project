// utilities.js

import { addMessageToConversation } from './uiService.js';

let userIP = null;

/**
 * Clears content of the specified element.
 * @param {string} id - The ID of the element to clear.
 */
export function clearElementContent(id) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
}

/**
 * Toggles display of the specified element.
 * @param {string} id - The ID of the element to toggle.
 * @param {string} displayStyle - The display style to set (default is 'block').
 */
export function toggleElementDisplay(id, displayStyle = 'block') {
    const element = document.getElementById(id);
    if (element) element.style.display = displayStyle;
}

/**
 * Formats text with HTML tags for bold, italics, strikethrough, and monospace.
 * @param {string} input - The text to format.
 * @returns {string} - The formatted text.
 */
function formatText(input) {
    return input
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')   // Bold
        .replace(/_(.*?)_/g, '<em>$1</em>')             // Italics
        .replace(/~(.*?)~/g, '<del>$1</del>')           // Strikethrough
        .replace(/```(.*?)```/g, '<code>$1</code>');    // Monospace
}

/**
 * Updates the response output element with a formatted message.
 * @param {string} message - The message to display.
 */
export function updateResponseOutput(message) {
    const responseOutput = document.getElementById('responseOutput');
    if (responseOutput) responseOutput.innerHTML = formatText(message);
}

/**
 * Shows a loading message in the conversation area.
 */
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
    if (loadingMessage) loadingMessage.remove();
    addMessageToConversation(formatText(responseText), 'bot');
}

/**
 * Fetch user's IP address if not already fetched.
 */
export async function fetchUserIP() {
    if (userIP) return userIP;
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Error fetching IP');
        userIP = (await response.json()).ip;
        console.log("User IP:", userIP);
        return userIP;
    } catch (error) {
        console.error('Failed to fetch IP:', error);
        return null;
    }
}
