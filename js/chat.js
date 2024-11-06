
// chat.js

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
    if (conversation) {
        conversation.innerHTML = ''; // Clear conversation area
        console.log("Conversation area cleared.");
    } else {
        console.warn("Conversation area not found.");
    }

    const responseOutput = document.getElementById('responseOutput');
    if (responseOutput) {
        responseOutput.innerText = ''; // Clear response message
        console.log("Response output cleared.");
    } else {
        console.warn("Response output not found.");
    }

    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        console.log("Welcome section displayed.");
    } else {
        console.warn("Welcome section not found.");
    }

    const newChatButton = document.querySelector('.new-chat-button');
    if (newChatButton) {
        newChatButton.classList.add('show-button');
        console.log("New chat button found and made visible:", newChatButton.classList);
    } else {
        console.error("New chat button not found.");
    }

    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = '';
        console.log("Message input field cleared.");
    } else {
        console.warn("Message input field not found.");
    }

    sessionStorage.cl
ear();
    console.log("Session data cleared.");
}

export { userIP };

setupEventListeners(sendMessage);
