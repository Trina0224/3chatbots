// Assume we have an array to store the message history
//
let messageHistory = [];
let bottomLeftMessageHistory = [];
let inputsHistory = [];
let bottomRightMessageHistory = [];
let sortedBotsByOutputLength = [];


function toggleLabel(checkboxId, labelId, muteText, unmuteText) {
    const checkbox = document.getElementById(checkboxId);
    const label = document.getElementById(labelId);

    if (checkbox.checked) {
        label.textContent = unmuteText;
    } else {
        label.textContent = muteText;
    }
}

// Call the function for each checkbox on page load and set event listeners
document.addEventListener('DOMContentLoaded', function() {
    toggleLabel('enableChatGPT', 'labelChatGPT', 'Mute ChatGPT', 'Unmute ChatGPT');
    toggleLabel('enableGemini', 'labelGemini', 'Mute Gemini', 'Unmute Gemini');
    toggleLabel('enableClaude', 'labelClaude', 'Mute Claude', 'Unmute Claude');

    document.getElementById('enableChatGPT').addEventListener('change', function() {
        toggleLabel('enableChatGPT', 'labelChatGPT', 'Mute ChatGPT', 'Unmute ChatGPT');
    });
    document.getElementById('enableGemini').addEventListener('change', function() {
        toggleLabel('enableGemini', 'labelGemini', 'Mute Gemini', 'Unmute Gemini');
    });
    document.getElementById('enableClaude').addEventListener('change', function() {
        toggleLabel('enableClaude', 'labelClaude', 'Mute Claude', 'Unmute Claude');
    });
});




async function processAndDisplayData() {
    const inputElement = document.getElementById('inputData');
    const oldInputsElement = document.getElementById('oldInputs');
    let newInput = inputElement.value.trim();

    // Check if newInput is empty and adjust accordingly
    if (!newInput) {
        newInput = "Human: (say nothing)"; // Specific string for empty input
    } else {
        newInput = "Human: " + newInput; // Prepend "Human: " to non-empty input
    }

    // Add the newInput to the inputsHistory array regardless of its state
    inputsHistory.push(newInput);

    // Clear the textarea
    inputElement.value = '';

    // Update the display based on the inputsHistory array
    oldInputsElement.innerHTML = ''; // Clear current display
    inputsHistory.forEach(input => {
        const inputDiv = document.createElement('div');
        inputDiv.textContent = input;
        oldInputsElement.appendChild(inputDiv);
    });

    // Ensure the latest input is visible
    oldInputsElement.scrollTop = oldInputsElement.scrollHeight;

    // Continue with the rest of the processing
    await compareAndSortOutputLengths();
    for (let bot of sortedBotsByOutputLength) {
        if (bot.name === "ChatGPT" && document.getElementById('enableChatGPT').checked) {
            await sendData();
        } else if (bot.name === "Gemini" && document.getElementById('enableGemini').checked) {
            await sendDataToBottomLeft();
        } else if (bot.name === "Claude" && document.getElementById('enableClaude').checked) {
            await sendDataToBottomRight();
        }
    }
}


async function sendData() {
    //const input = document.getElementById('inputData').value;
    //const inputElement = document.getElementById('inputData');
    //const oldInputsElement = document.getElementById('oldInputs');
    //const newInput = inputElement.value.trim();
    const newInput = inputsHistory.length > 0 ? inputsHistory[inputsHistory.length - 1] : '';
    //const bottomLeft = document.getElementById('bottomLeft').textContent;
    const bottomLeftLastTwo = bottomLeftMessageHistory.slice(-2).join(' ');
    //const bottomRight = document.getElementById('bottomRight').textContent;
    const bottomRightLastTwoResponses = bottomRightMessageHistory.slice(-2).join(' ');
    
    const message = `${newInput} ${bottomLeftLastTwo} ${bottomRightLastTwoResponses}`;
    //console.log(message);
    console.log('Sending to ChatGPT:', message);

    /*
    if (newInput) {
        // Add new input to the message history
        inputsHistory.push(newInput);
        
        // Update the old inputs display
        const newInputDiv = document.createElement('div');
        newInputDiv.textContent = newInput;
        //oldInputsElement.prepend(newInputDiv); // Adds the new input at the top of the old inputs area
        oldInputsElement.appendChild(newInputDiv); // Adds the new input at the bottom of the old inputs area

        // Clear the text area for the next input
        inputElement.value = '';
        
        // Keep only the latest 2 entries from the bottom left (if needed for another function)
        // const latestTwoInputs = messageHistory.slice(-2);

        // Scroll to the top to show the most recent old input
        //oldInputsElement.scrollTop = 0;
        oldInputsElement.scrollTop = oldInputsElement.scrollHeight;
    }
    */

    try {
        // Get the values of both elements
        const trait1Value = document.getElementById('trait1').value;
        const traitCommonValue = document.getElementById('traitCommon').value;

        // Merge the two strings
        const mergedTraits = `${trait1Value} ${traitCommonValue}`;
        //console.log('Preset to ChatGPT: ',mergedTraits);

        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            //body: JSON.stringify({ message }),
            body: JSON.stringify({
                message: message,
                trait1: mergedTraits // Gets the content of the textarea
            }),
        });
        const data = await response.json();
        
        // Update to append new message to the history
        //const newMessage = `Gemini: ${data.text}`;
        const newMessage = `ChatGPT: ${data.choices[0].message.content}`;
        const newMessage2 = marked.parse(newMessage); //change to markdown format.
        messageHistory.push(newMessage2); // Store the new message in history
        
        updateTopRightArea(); // Call function to update the display
    } catch (error) {
        console.error('Failed to communicate with the chatbot backend.', error);
    }
}

/*
function updateTopRightArea() {
    const chatbotResponseArea = document.getElementById('chatbotResponse');
    // Prepend "ChatGPT: " to each message
    chatbotResponseArea.innerHTML = messageHistory.map(msg => `ChatGPT: ${msg}`).join('<br><br>');
    chatbotResponseArea.scrollTop = chatbotResponseArea.scrollHeight;
}
*/
function updateTopRightArea() {
    const chatbotResponseArea = document.getElementById('chatbotResponse');
    
    // Clear the area before repopulating
    chatbotResponseArea.innerHTML = '';
    
    // Assuming messageHistory contains markdown formatted messages
    messageHistory.forEach((msg, index) => {
        // Create a div for each message
        const messageDiv = document.createElement('div');
        
        // Apply the "new-message" class to the last message, and "old-message" to the others
        if (index === messageHistory.length - 1) {
            messageDiv.className = 'new-message';
        } else {
            messageDiv.className = 'old-message';
        }
        
        // Set the inner HTML of the div to the markdown parsed message
        messageDiv.innerHTML = marked.parse(msg);
        //messageDiv.innerHTML = marked.parse(`ChatGPT: ${msg}`);
        
        // Append the div to the chatbot response area
        chatbotResponseArea.appendChild(messageDiv);
    });
    
    // Scroll to the bottom of the area to show the latest message
    chatbotResponseArea.scrollTop = chatbotResponseArea.scrollHeight;
}



async function sendDataToBottomLeft() {
    //const input = document.getElementById('inputData').value;
    const latestInput = inputsHistory[inputsHistory.length - 1];
    // Assuming you're using messageHistory for the top-right area responses
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    //const bottomRight = document.getElementById('bottomRight').textContent;
    const bottomRightLastTwoResponses = bottomRightMessageHistory.slice(-2).join(' ');

    //const trait2 = document.getElementById('trait2').value;


    
    
    const message = `${latestInput} ${topRightLastTwoResponses} ${bottomRightLastTwoResponses}`;
    //console.log(message);
    console.log('Sending to Gemini:', message);

    try {

        // Get the values of both elements
        const trait2Value = document.getElementById('trait2').value;
        const traitCommonValue = document.getElementById('traitCommon').value;

        // Merge the two strings
        const mergedTraits = `${trait2Value} ${traitCommonValue}`;
        //console.log('Preset to Gemini: ',mergedTraits);

        const response = await fetch('/generateWithGemini', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: message,
                trait2: mergedTraits // Gets the content of the textarea
            }),
        });
        const data = await response.json();

        //Update to apped new message to the history
        //const newMessage = data.text;
        //console.log('Got from Gemini:', newMessage);
        const newMessage = `Gemini: ${data.text}`;
        const newMessage2 = marked.parse(newMessage);
        bottomLeftMessageHistory.push(newMessage2);

        updateBottomLeftArea();
        
       /* // Assuming the structure of data returned matches what you expect
        document.getElementById('bottomLeft').innerHTML += `${data.text}<br><br>`; // Append new message
        
        // Scroll to the bottom of the bottom-left area
        const bottomLeftArea = document.getElementById('bottomLeft');
        bottomLeftArea.scrollTop = bottomLeftArea.scrollHeight;
        */
    } catch (error) {
        console.error('Failed to communicate with the Gemini backend.', error);
    }
}


/*
function updateBottomLeftArea() {
    const bottomLeftArea = document.getElementById('bottomLeft');
    bottomLeftArea.innerHTML = bottomLeftMessageHistory.join('<br><br>'); // Join messages with breaks
    
    // Scroll to the bottom of the area to show the latest message
    bottomLeftArea.scrollTop = bottomLeftArea.scrollHeight;
}
*/
function updateBottomLeftArea() {
    const bottomLeftArea = document.getElementById('bottomLeft');
    
    // Clear the area before repopulating
    bottomLeftArea.innerHTML = '';
    
    // Assuming bottomLeftMessageHistory contains markdown formatted messages
    bottomLeftMessageHistory.forEach((msg, index) => {
        // Create a div for each message
        const messageDiv = document.createElement('div');
        
        // Apply the "new-message" class to the last message, and "old-message" to the others
        if (index === bottomLeftMessageHistory.length - 1) {
            messageDiv.className = 'new-message';
        } else {
            messageDiv.className = 'old-message';
        }
        
        // Set the inner HTML of the div to the markdown parsed message
        messageDiv.innerHTML = marked.parse(msg);
        
        // Append the div to the chatbot response area
        bottomLeftArea.appendChild(messageDiv);
    });
    
    // Scroll to the bottom of the area to show the latest message
    bottomLeftArea.scrollTop = bottomLeftArea.scrollHeight;
}


async function sendDataToBottomRight() {
    const latestInput = inputsHistory.slice(-1).join(' '); // Gets the latest input
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    const bottomLeftLastTwoResponses = bottomLeftMessageHistory.slice(-2).join(' ');

    //const trait3 = document.getElementById('trait3').value;
    
    const message = `${latestInput} ${topRightLastTwoResponses} ${bottomLeftLastTwoResponses}`;
    console.log('Sending to Claude:', message);

    try {
        // Get the values of both elements
        const trait3Value = document.getElementById('trait3').value;
        const traitCommonValue = document.getElementById('traitCommon').value;

        // Merge the two strings
        const mergedTraits = `${trait3Value} ${traitCommonValue}`;
        //console.log('Preset to Claude: ',mergedTraits);
        
        const response = await fetch('/chatWithClaude', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: message,
                trait3: mergedTraits // Gets the content of the textarea
            }),
        });
        const data = await response.json();
        // Adjust the path to access the nested text based on the Claude response structure
        //const claudeResponseText = data.msg.content.map(item => item.text).join('\n');
        const claudeResponseText = `Claude: ${data.msg.content.map(item => item.text).join('\n')}`;
        const claudeResponseText2 = marked.parse(claudeResponseText);
        bottomRightMessageHistory.push(claudeResponseText2);
        //updateBottomRightArea(claudeResponseText2); // Update the bottom-right area with the response
        updateBottomRightArea();
    } catch (error) {
        console.error('Failed to communicate with the server.', error);
    }
}

/*
function updateBottomRightArea(text) {
    const bottomRightArea = document.getElementById('bottomRight');
    bottomRightArea.innerHTML += `${text}<br><br>`; // Append new message
    bottomRightArea.scrollTop = bottomRightArea.scrollHeight; // Scroll to the latest message
}
*/
function updateBottomRightArea() {
    const bottomRightArea = document.getElementById('bottomRight');

    // Clear the area before repopulating
    bottomRightArea.innerHTML = '';
    
    // Assuming bottomRightMessageHistory contains markdown formatted messages
    bottomRightMessageHistory.forEach((msg, index) => {
        // Create a div for each message
        const messageDiv = document.createElement('div');
        
        // Apply the "new-message" class to the last message, and "old-message" to the others
        if (index === bottomRightMessageHistory.length - 1) {
            messageDiv.className = 'new-message';
        } else {
            messageDiv.className = 'old-message';
        }
        
        // Set the inner HTML of the div to the markdown parsed message
        messageDiv.innerHTML = marked.parse(msg);
        
        // Append the div to the bottom right area
        bottomRightArea.appendChild(messageDiv);
    });
    
    // Scroll to the bottom of the area to show the latest message
    bottomRightArea.scrollTop = bottomRightArea.scrollHeight;
}


async function compareAndSortOutputLengths() {
    // Simulate getting the lengths of outputs as we cannot really call the services without actual implementations
    const chatGPTOutputLength = messageHistory.length > 0 ? messageHistory[messageHistory.length - 1].length : 0;
    const geminiOutputLength = bottomLeftMessageHistory.length > 0 ? bottomLeftMessageHistory[bottomLeftMessageHistory.length - 1].length : 0;
    const claudeOutputLength = bottomRightMessageHistory.length > 0 ? bottomRightMessageHistory[bottomRightMessageHistory.length - 1].length : 0;

    const botsWithLastMessageLength = [
        { name: "ChatGPT", length: chatGPTOutputLength },
        { name: "Gemini", length: geminiOutputLength },
        { name: "Claude", length: claudeOutputLength }
    ];

    // Sort bots by the length of their last message, longest first. If lengths are equal, maintain the order ChatGPT > Gemini > Claude
    botsWithLastMessageLength.sort((a, b) => {
        if (a.length === b.length) {
            return ["ChatGPT", "Gemini", "Claude"].indexOf(a.name) - ["ChatGPT", "Gemini", "Claude"].indexOf(b.name);
        }
        return b.length - a.length; // For descending order
    });

    sortedBotsByOutputLength = botsWithLastMessageLength;
    console.log("Bots sorted by last message length:", botsWithLastMessageLength);
}


