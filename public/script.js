// Assume we have an array to store the message history
//
let messageHistory = [];
let bottomLeftMessageHistory = [];
let inputsHistory = [];
let bottomRightMessageHistory = [];
let sortedBotsByOutputLength = [];
let uploadedImageUrl = "";


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

    // ChatGPT
    document.getElementById('enableChatGPT').addEventListener('change', function() {
        toggleLabel('enableChatGPT', 'labelChatGPT', 'Mute ChatGPT', 'Unmute ChatGPT');
        toggleContainerVisibility('top-left', this.checked);
    });

    // Gemini
    document.getElementById('enableGemini').addEventListener('change', function() {
        toggleLabel('enableGemini', 'labelGemini', 'Mute Gemini', 'Unmute Gemini');
        toggleContainerVisibility('bottom-left', this.checked);
    });

    // Claude
    document.getElementById('enableClaude').addEventListener('change', function() {
        toggleLabel('enableClaude', 'labelClaude', 'Mute Claude', 'Unmute Claude');
        toggleContainerVisibility('bottom-right', this.checked);
    });
});

// Function to toggle the visibility of chatbot containers
function toggleContainerVisibility(containerId, isVisible) {
    const container = document.querySelector('.' + containerId);
    if (container) {
        container.style.display = isVisible ? 'block' : 'none';
    }
}

function checkScreenAndAdjustCheckbox() {
    const discussionCheckbox = document.getElementById('discussionInOneContainer');
    if (window.innerWidth <= 576) {
        discussionCheckbox.checked = true;
        toggleDiscussionContainer(true); // Assuming this is the function you've implemented to show/hide containers
    } else {
        // Do not automatically uncheck to respect the user's choice. Optionally, add logic here if needed.
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkScreenAndAdjustCheckbox);

// Run on window resize
window.addEventListener('resize', checkScreenAndAdjustCheckbox);



/*
document.addEventListener('DOMContentLoaded', function() {
    // Attach an event listener to the checkbox
    document.getElementById('discussionInOneContainer').addEventListener('change', function() {
        toggleDiscussionContainer(this.checked);
    });
});

function toggleDiscussionContainer(isChecked) {
    const discussionContainer = document.getElementById('discussionContainer');
    const chatContainers = document.querySelectorAll('.top-left, .top-right, .bottom-left, .bottom-right');

    if (isChecked) {
        // Adjust styles when checked
        discussionContainer.style.display = 'block';
        discussionContainer.style.height = '66.67vh'; // 2/3 of the screen height
        discussionContainer.style.overflowY = 'scroll'; // Ensure it has a vertical scroll
        chatContainers.forEach(container => {
            container.style.height = 'calc(33.33vh - 20px)'; // Adjusted to 1/3
        });
    } else {
        // Revert styles when unchecked
        discussionContainer.style.display = 'none';
        discussionContainer.style.height = '0';
        chatContainers.forEach(container => {
            container.style.removeProperty('height'); // Removes inline height style
        });
    }
}
*/

// Enhanced toggleDiscussionContainer function
function toggleDiscussionContainer(isChecked) {
    const discussionContainer = document.getElementById('discussionContainer');
    // Define selectors for the containers and their corresponding checkboxes
    const containersInfo = [
        { container: '.top-right', checkbox: 'enableChatGPT' },
        { container: '.bottom-left', checkbox: 'enableGemini' },
        { container: '.bottom-right', checkbox: 'enableClaude' }
    ];

    if (isChecked) {
        // Show the discussionContainer and hide others
        discussionContainer.style.display = 'block';
        containersInfo.forEach(info => {
            document.querySelector(info.container).style.display = 'none';
        });
    } else {
        // Hide the discussionContainer
        discussionContainer.style.display = 'none';
        // Check each chatbot's mute/unmute status before deciding to show its container
        containersInfo.forEach(info => {
            const checkbox = document.getElementById(info.checkbox);
            const container = document.querySelector(info.container);
            // Show the container only if its corresponding checkbox is checked (unmuted)
            container.style.display = checkbox.checked ? 'block' : 'none';
        });
    }
}

// Ensure the event listener for "Discussion in one container" checkbox is set up correctly
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('discussionInOneContainer').addEventListener('change', function() {
        toggleDiscussionContainer(this.checked);
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
    //
    //if (document.getElementById('discussionInOneContainer').checked) {
    //    appendMessageToDiscussionContainer(newInput); // For sendDataToBottomLeft and sendDataToBottomRight, ensure newMessage2 is the formatted message you intend to append
    //}
    appendMessageToDiscussionContainer(newInput);

    // Clear the textarea
    inputElement.value = '';
    //04022024 bug!!! document.getElementById('linkInput').value = '';

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

/*
async function sendData() {
    const newInput = inputsHistory.length > 0 ? inputsHistory[inputsHistory.length - 1] : '';
    const bottomLeftLastTwo = bottomLeftMessageHistory.slice(-2).join(' ');
    const bottomRightLastTwoResponses = bottomRightMessageHistory.slice(-2).join(' ');
    const message = `${newInput} ${bottomLeftLastTwo} ${bottomRightLastTwoResponses}`;
    console.log('Sending to ChatGPT:', message);

    const linkInput = document.getElementById('linkInput').value.trim(); // Get the link input
    const trait1Value = document.getElementById('trait1').value;
    const traitCommonValue = document.getElementById('traitCommon').value;
    const mergedTraits = `${trait1Value} ${traitCommonValue}`;

    let endpoint = '/chat'; // Default endpoint
    let requestBody = {
        message: message,
        trait1: mergedTraits // System message content
    };

    // If there's a link, switch to the /chatWithImage endpoint and adjust requestBody
    if (linkInput) {
        endpoint = '/chatWithImage';
        requestBody = {
            imageUrl: linkInput,
            userText: message, // The actual user input text
            trait1: mergedTraits // System message content, shared for consistency
        };
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        
        // Extracting the message content based on the response structure
        let responseMessage;
        if (endpoint === '/chatWithImage') {
            // Directly accessing the 'message.content' for the '/chatWithImage' endpoint response
            responseMessage = `ChatGPT: ${data.message.content}`;
        } else {
            // Assuming '/chat' endpoint returns a structure with 'choices'
            responseMessage = `ChatGPT: ${data.choices[0].message.content}`;
        }
        // Assuming both endpoints return data with similar structure
        //const responseMessage = endpoint === '/chatWithImage' ? `ChatGPT: ${data.content}` : `ChatGPT: ${data.choices[0].message.content}`;
        const formattedMessage = marked.parse(responseMessage); // Convert to markdown format.
        messageHistory.push(formattedMessage); // Store the new message in history
        
        updateTopRightArea(); // Call function to update the display
        
        if (document.getElementById('discussionInOneContainer').checked) {
            appendMessageToDiscussionContainer(formattedMessage);
        }
    } catch (error) {
        console.error('Failed to communicate with the chatbot backend.', error);
    }
}
*/


async function sendData() {
    const newInput = inputsHistory.length > 0 ? inputsHistory[inputsHistory.length - 1] : '';
    const bottomLeftLastTwo = bottomLeftMessageHistory.slice(-2).join(' ');
    const bottomRightLastTwoResponses = bottomRightMessageHistory.slice(-2).join(' ');
    const message = `${newInput} ${bottomLeftLastTwo} ${bottomRightLastTwoResponses}`;
    console.log('Sending to ChatGPT:', message);

    const inputDataElement = document.getElementById('inputData');
    //const inputDataElement = newInput;//for image, use different prompt. 
    let newInput_img = inputDataElement.value.trim();
    const trait1Value = document.getElementById('trait1').value;
    const traitCommonValue = document.getElementById('traitCommon').value;
    const mergedTraits = `${trait1Value} ${traitCommonValue}`;

    // Use the directly provided URL or the URL from the uploaded file
    let imageUrl = document.getElementById('linkInput').value.trim(); // || uploadedImageUrl;
    console.log("imageUrl: ",imageUrl);

    let endpoint = imageUrl ? '/chatWithImage' : '/chat';
    let requestBody = {
        message: message, //newInput,
        trait1: mergedTraits
    };

    if (imageUrl) {
        // Add imageUrl to the request body if present
        requestBody = {...requestBody, imageUrl: imageUrl, userText: newInput_img};
    }

    let fetchOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch(endpoint, fetchOptions);
        const data = await response.json();
        
        let responseMessage = endpoint === '/chatWithImage' ? `ChatGPT: ${data.message.content}` : `ChatGPT: ${data.choices[0].message.content}`;

        const formattedMessage = marked.parse(responseMessage);
        messageHistory.push(formattedMessage);
        updateTopRightArea();

        //if (document.getElementById('discussionInOneContainer').checked) {
        //    appendMessageToDiscussionContainer(formattedMessage);
        //}
        appendMessageToDiscussionContainer(formattedMessage);
        // Clear the inputs after sending
        inputDataElement.value = '';
        //BUG 0403 document.getElementById('linkInput').value = ''; // Optionally clear the link input
        // Optionally clear the uploadedImageUrl variable if it's no longer needed
        //BUG 0403 uploadedImageUrl = "";
    } catch (error) {
        console.error('Failed to communicate with the backend.', error);
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


/*
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
        //
        if (document.getElementById('discussionInOneContainer').checked) {
            appendMessageToDiscussionContainer(newMessage2); // For sendDataToBottomLeft and sendDataToBottomRight, ensure newMessage2 is the formatted message you intend to append
        }
        
    } catch (error) {
        console.error('Failed to communicate with the Gemini backend.', error);
    }
}
*/

async function sendDataToBottomLeft() {
    const latestInput = inputsHistory[inputsHistory.length - 1];
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    const bottomRightLastTwoResponses = bottomRightMessageHistory.slice(-2).join(' ');

    const message = `${latestInput} ${topRightLastTwoResponses} ${bottomRightLastTwoResponses}`;
    console.log('Sending to Gemini:', message);

    // Determine if an image has been uploaded
    const imageUploaded = document.getElementById('fileInput').files.length > 0;

    let endpoint = '/generateWithGemini'; // Default endpoint
    let fetchOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            message: message,
            trait2: `${document.getElementById('trait2').value} ${document.getElementById('traitCommon').value}` // Merging trait2 and traitCommon values
        }),
    };

    // If an image is uploaded, adjust the endpoint and fetch options
    if (imageUploaded) {
        endpoint = '/generateWithGeminiAndImage';
        // Since the image needs to be sent as FormData, we'll change the fetch options accordingly
        const formData = new FormData();
        formData.append('imageFile', document.getElementById('fileInput').files[0]);
        formData.append('message', message);
        formData.append('trait2', `${document.getElementById('trait2').value} ${document.getElementById('traitCommon').value}`); // Merging trait2 and traitCommon values

        fetchOptions = {
            method: 'POST',
            body: formData,
            // Headers are not set explicitly; the browser will set the Content-Type to multipart/form-data and include the boundary automatically
        };
    }

    try {
        const response = await fetch(endpoint, fetchOptions);
        const data = await response.json();

        const newMessage = `Gemini: ${data.text}`;
        const formattedMessage = marked.parse(newMessage); // Assuming you are using Marked.js for markdown parsing
        bottomLeftMessageHistory.push(formattedMessage);
        updateBottomLeftArea();

        //if (document.getElementById('discussionInOneContainer').checked) {
        //    appendMessageToDiscussionContainer(formattedMessage);
        //}
        appendMessageToDiscussionContainer(formattedMessage);
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

/*
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
        //
        if (document.getElementById('discussionInOneContainer').checked) {
            appendMessageToDiscussionContainer(claudeResponseText2); // For sendDataToBottomLeft and sendDataToBottomRight, ensure newMessage2 is the formatted message you intend to append
        }
    } catch (error) {
        console.error('Failed to communicate with the server.', error);
    }
}
*/

async function sendDataToBottomRight() {
    const latestInput = inputsHistory.slice(-1).join(' '); // Gets the latest input
    const topRightLastTwoResponses = messageHistory.slice(-2).join(' '); 
    const bottomLeftLastTwoResponses = bottomLeftMessageHistory.slice(-2).join(' ');

    const message = `${latestInput} ${topRightLastTwoResponses} ${bottomLeftLastTwoResponses}`;
    console.log('Sending to Claude:', message);

    // Determine if an image has been uploaded and prepare the data
    const imageUploaded = document.getElementById('fileInput').files.length > 0;
    let endpoint = '/chatWithClaude'; // Default endpoint
    let fetchOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            message: message,
            trait3: `${document.getElementById('trait3').value} ${document.getElementById('traitCommon').value}` // Merging trait3 and traitCommon values
        }),
    };

    // If an image is uploaded, switch to the /chatWithClaudeImage endpoint and adjust requestBody
    if (imageUploaded) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64Image = e.target.result.split(',')[1]; // Get the base64 content, remove the prefix
            endpoint = '/chatWithClaudeImage';
            fetchOptions.body = JSON.stringify({
                image1_media_type: document.getElementById('fileInput').files[0].type,
                image1_data: base64Image,
                inputMessage: message,
                trait3: `${document.getElementById('trait3').value} ${document.getElementById('traitCommon').value}`
            });

            try {
                const response = await fetch(endpoint, fetchOptions);
                const data = await response.json();
                const formattedMessage = marked.parse(`Claude: ${data.msg.content.map(item => item.text).join('\n')}`);
                bottomRightMessageHistory.push(formattedMessage);
                updateBottomRightArea();

                //if (document.getElementById('discussionInOneContainer').checked) {
                //    appendMessageToDiscussionContainer(formattedMessage);
                //}
                appendMessageToDiscussionContainer(formattedMessage);
            } catch (error) {
                console.error('Failed to communicate with Claude Image API.', error);
            }
        };

        // Read the file as a data URL to trigger the onload event
        reader.readAsDataURL(document.getElementById('fileInput').files[0]);
    } else {
        // No image uploaded, proceed with sending text only
        try {
            const response = await fetch(endpoint, fetchOptions);
            const data = await response.json();
            const formattedMessage = marked.parse(`Claude: ${data.msg.content.map(item => item.text).join('\n')}`);
            bottomRightMessageHistory.push(formattedMessage);
            updateBottomRightArea();

            //if (document.getElementById('discussionInOneContainer').checked) {
            //    appendMessageToDiscussionContainer(formattedMessage);
            //}
            appendMessageToDiscussionContainer(formattedMessage);
        } catch (error) {
            console.error('Failed to communicate with the Claude API.', error);
        }
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


//
function appendMessageToDiscussionContainer(message) {
    const discussionContainer = document.getElementById('discussionContainer');
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;
    discussionContainer.appendChild(messageDiv);
    
    // Ensure discussionContainer can scroll vertically
    discussionContainer.style.overflowY = 'auto';

    // Scroll to the bottom of the container to show the latest message
    discussionContainer.scrollTop = discussionContainer.scrollHeight;
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

//04022024
const linkButton = document.getElementById('linkButton');
const linkInput = document.getElementById('linkInput');

linkButton.addEventListener('click', () => {
    const isLinkInputVisible = linkInput.style.display !== 'none';
    linkInput.style.display = isLinkInputVisible ? 'none' : 'block';
});

//04032024
document.getElementById('fileUploadButton').addEventListener('click', function() {
    document.getElementById('fileInput').click(); // Trigger file selection dialog
});

document.getElementById('fileInput').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // Ensure the file is an image
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                const previewContainer = document.getElementById('imagePreviewContainer');
                preview.src = e.target.result; // Preview the selected image
                preview.style.display = 'block';
                const base64EncodedImage = e.target.result; // This is your base64-encoded image
                document.getElementById('linkInput').value = base64EncodedImage; // Assuming you want to use the same input to hold the base64 string
                
                // Call uploadFile function right after setting the preview
                //uploadFile();
                // Create and append the X emoji 04042024.
                const xEmoji = document.createElement('span');
                xEmoji.textContent = '❌'; // X emoji
                xEmoji.classList.add('x-emoji');
                xEmoji.onclick = function() {
                    preview.src = ''; // Remove image source
                    preview.style.display = 'none'; // Hide the image
                    previewContainer.removeChild(xEmoji); // Remove the X emoji itself
                    // Clear the file input
                    document.getElementById('fileInput').value = '';

                    // Clear the textarea
                    document.getElementById('linkInput').value = '';

                    // Optionally, hide the textarea if it's meant to be toggled with the link button
                    document.getElementById('linkInput').style.display = 'none';
                };

                // Append only if an X doesn't already exist
                if (!previewContainer.querySelector('.x-emoji')) {
                    previewContainer.appendChild(xEmoji);
                }
            };
            
            reader.readAsDataURL(file); // Start reading the file as DataURL
        } else {
            alert('Please select an image file.');
        }
    }
});

/*
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();

    if (fileInput.files.length > 0) {
        formData.append('imageFile', fileInput.files[0]); // Prepare the file for uploading

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            alert('File uploaded successfully!');
            // Log the URL returned by the server
            console.log('Upload success:', data);
            console.log('Uploaded file URL:', data.url); // Assuming 'url' is the key in the response JSON
            uploadedImageUrl = data.url;

            // Optionally, you could also update some element with the URL
            // document.getElementById('someElement').textContent = data.url;
        })
        .catch((error) => {
            console.error('Upload error:', error);
            alert('Upload failed.');
        });
    } else {
        // This alert might not be necessary since the upload is initiated upon file selection
        alert('Please select a file first.');
    }
}
*/



//fix DOM before and after issue
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileInput').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                if (preview) { // Check if the element exists
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                } else {
                    console.error('Element with ID imagePreview not found');
                }
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
});

