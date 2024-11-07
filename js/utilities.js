/** utilities.js
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
    document.getElementById('responseOutput').innerText = message;
}
