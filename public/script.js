// Assume we have an array to store the message history
let messageHistory = [];
let bottomLeftMessageHistory = [];
let inputsHistory = [];


async function sendData() {
    //const input = document.getElementById('inputData').value;
    const inputElement = document.getElementById('inputData');
    const oldInputsElement = document.getElementById('oldInputs');
    const newInput = inputElement.value.trim();
    
    //const bottomLeft = document.getElementById('bottomLeft').textContent;
    const bottomLeftLastTwo = bottomLeftMessageHistory.slice(-2).join(' ');
    const bottomRight = document.getElementById('bottomRight').textContent;
    
    const message = `${newInput} ${bottomLeftLastTwo} ${bottomRight}`;
    //console.log(message);
    console.log('Sending to ChatGPT:', message);

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

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            //body: JSON.stringify({ message }),
            body: JSON.stringify({
                message: message,
                trait1: document.getElementById('trait1').value // Gets the content of the textarea
            }),
        });
        const data = await response.json();
        
        // Update to append new message to the history
        const newMessage = data.choices[0].message.content;
        messageHistory.push(newMessage); // Store the new message in history
        
        updateTopRightArea(); // Call function to update the display
    } catch (error) {
        console.error('Failed to communicate with the chatbot backend.', error);
    }
}
/*
function updateTopRightArea() {
    const chatbotResponseArea = document.getElementById('chatbotResponse');
    chatbotResponseArea.innerHTML = messageHistory.join('<br><br>'); // Join messages with breaks
    
    // Scroll to the bottom of the area to show the latest message
    chatbotResponseArea.scrollTop = chatbotResponseArea.scrollHeight;
}
*/
function updateTopRightArea() {
    const chatbotResponseArea = document.getElementById('chatbotResponse');
    // Prepend "ChatGPT: " to each message
    chatbotResponseArea.innerHTML = messageHistory.map(msg => `ChatGPT: ${msg}`).join('<br><br>');
    chatbotResponseArea.scrollTop = chatbotResponseArea.scrollHeight;
}


async function sendDataToBottomLeft() {
    //const input = document.getElementById('inputData').value;
    const latestInput = inputsHistory[inputsHistory.length - 1];
    // Assuming you're using messageHistory for the top-right area responses
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    const bottomRight = document.getElementById('bottomRight').textContent;
    const trait2 = document.getElementById('trait2').value;

    
    const message = `${latestInput} ${topRightLastTwoResponses} ${bottomRight}`;
    //console.log(message);
    console.log('Sending to Gemini:', message);

    try {
        const response = await fetch('/generateWithGemini', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message, trait2 }),
        });
        const data = await response.json();

        //Update to apped new message to the history
        //const newMessage = data.text;
        //console.log('Got from Gemini:', newMessage);
        const newMessage = `Gemini: ${data.text}`;
        bottomLeftMessageHistory.push(newMessage);

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



function updateBottomLeftArea() {
    const bottomLeftArea = document.getElementById('bottomLeft');
    bottomLeftArea.innerHTML = bottomLeftMessageHistory.join('<br><br>'); // Join messages with breaks
    
    // Scroll to the bottom of the area to show the latest message
    bottomLeftArea.scrollTop = bottomLeftArea.scrollHeight;
}
/*
function updateBottomLeftArea() {
    const bottomLeftArea = document.getElementById('bottomLeft');
    // Prepend "Gemini: " to each message
    bottomLeftArea.innerHTML = bottomLeftMessageHistory.map(msg => `Gemini: ${msg}`).join('<br><br>');
    bottomLeftArea.scrollTop = bottomLeftArea.scrollHeight;
}
*/



async function sendDataToBottomRight() {
    const latestInput = inputsHistory.slice(-1).join(' '); // Gets the latest input
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    const bottomLeftLastTwoResponses = bottomLeftMessageHistory.slice(-2).join(' ');

    const trait3 = document.getElementById('trait3').value;
    
    const message = `${latestInput} ${topRightLastTwoResponses} ${bottomLeftLastTwoResponses}`;
    console.log('Sending to Claude:', message);

    try {
        const response = await fetch('/chatWithClaude', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message, trait3 }),
        });
        const data = await response.json();
        // Adjust the path to access the nested text based on the Claude response structure
        //const claudeResponseText = data.msg.content.map(item => item.text).join('\n');
        const claudeResponseText = `Claude: ${data.msg.content.map(item => item.text).join('\n')}`;
        updateBottomRightArea(claudeResponseText); // Update the bottom-right area with the response
    } catch (error) {
        console.error('Failed to communicate with the server.', error);
    }
}

function updateBottomRightArea(text) {
    const bottomRightArea = document.getElementById('bottomRight');
    bottomRightArea.innerHTML += `${text}<br><br>`; // Append new message
    bottomRightArea.scrollTop = bottomRightArea.scrollHeight; // Scroll to the latest message
}



