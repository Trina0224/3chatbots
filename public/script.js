// Assume we have an array to store the message history
let messageHistory = [];
let bottomLeftMessageHistory = [];


async function sendData() {
    const input = document.getElementById('inputData').value;
    //const bottomLeft = document.getElementById('bottomLeft').textContent;
    const bottomLeftLastTwo = bottomLeftMessageHistory.slice(-2).join(' ');
    const bottomRight = document.getElementById('bottomRight').textContent;
    
    const message = `${input} ${bottomLeftLastTwo} ${bottomRight}`;
    console.log(message);

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message }),
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

function updateTopRightArea() {
    const chatbotResponseArea = document.getElementById('chatbotResponse');
    chatbotResponseArea.innerHTML = messageHistory.join('<br><br>'); // Join messages with breaks
    
    // Scroll to the bottom of the area to show the latest message
    chatbotResponseArea.scrollTop = chatbotResponseArea.scrollHeight;
}

async function sendDataToBottomLeft() {
    const input = document.getElementById('inputData').value;
    // Assuming you're using messageHistory for the top-right area responses
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    const bottomRight = document.getElementById('bottomRight').textContent;
    
    const message = `${input} ${topRightLastTwoResponses} ${bottomRight}`;
    console.log(message);

    try {
        const response = await fetch('/generateWithGemini', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message }),
        });
        const data = await response.json();

        //Update to apped new message to the history
        const newMessage = data.text;
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



