// Assume we have an array to store the message history
//
let messageHistory = [];
let bottomLeftMessageHistory = [];
let inputsHistory = [];
let bottomRightMessageHistory = [];
let sortedBotsByOutputLength = [];
let uploadedImageUrl = ""; //looks like this line is useless.
let shouldRemoveImageOnNextSend = false; // State flag


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
    toggleLabel('enableChatGPT', 'labelChatGPT', 'ChatGPT Muted', 'ChatGPT Unmuted');
    toggleLabel('enableGemini', 'labelGemini', 'Gemini Muted', 'Gemini Unmuted');
    toggleLabel('enableClaude', 'labelClaude', 'Claude Muted', 'Claude Unmuted');

    // ChatGPT
    document.getElementById('enableChatGPT').addEventListener('change', function() {
        toggleLabel('enableChatGPT', 'labelChatGPT', 'ChatGPT Muted', 'ChatGPT Unmuted');
        toggleContainerVisibility('top-right', this.checked);
    });

    // Gemini
    document.getElementById('enableGemini').addEventListener('change', function() {
        toggleLabel('enableGemini', 'labelGemini', 'Gemini Muted', 'Gemini Unmuted');
        toggleContainerVisibility('bottom-left', this.checked);
    });

    // Claude
    document.getElementById('enableClaude').addEventListener('change', function() {
        toggleLabel('enableClaude', 'labelClaude', 'Claude Muted', 'Claude Unmuted');
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





// Enhanced toggleDiscussionContainer function
function toggleDiscussionContainer(isChecked) {
    const discussionContainer = document.getElementById('discussionContainer');
    const topLeftContainer = document.querySelector('.top-left'); // Target the top-left container correctly
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
        topLeftContainer.classList.add('full-width'); // Make top-left container full width
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
        topLeftContainer.classList.remove('full-width'); // Revert top-left container to original width
    }
}

// Ensure the event listener for "Discussion in one container" checkbox is set up correctly
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('discussionInOneContainer').addEventListener('change', function() {
        toggleDiscussionContainer(this.checked);
    });
});

function clearImage() {
    const imagePreview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('fileInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const xEmoji = imagePreviewContainer.querySelector('.x-emoji');

    if (imagePreview) {
        imagePreview.src = ''; // Clear image source
        imagePreview.style.display = 'none'; // Hide the image
    }
    if (xEmoji) {
        imagePreviewContainer.removeChild(xEmoji); // Remove the X emoji if present
    }
    fileInput.value = ''; // Reset the file input
    shouldRemoveImageOnNextSend = false; // Reset the flag
}



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
    appendMessageToDiscussionContainer(newInput, "Human");

    // Clear the textarea
    inputElement.value = '';
    //04132024
    if (shouldRemoveImageOnNextSend) {
        clearImage(); // Call to clear the image if the flag is true
    } else {
        shouldRemoveImageOnNextSend = true; // Set the flag on the first send after image upload
    }
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

function toggleLoader(show) {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}


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
    toggleLoader(true); 
    try {
        const response = await fetch(endpoint, fetchOptions);
        const data = await response.json();
        
        let responseMessage = endpoint === '/chatWithImage' ? `ChatGPT: ${data.message.content}` : `ChatGPT: ${data.choices[0].message.content}`;

        const formattedMessage = marked.parse(responseMessage);
        messageHistory.push(formattedMessage);
        updateTopRightArea();

        appendMessageToDiscussionContainer(formattedMessage, "ChatGPT");
        // Clear the inputs after sending
        inputDataElement.value = '';
        //BUG 0403 document.getElementById('linkInput').value = ''; // Optionally clear the link input
        // Optionally clear the uploadedImageUrl variable if it's no longer needed
        //BUG 0403 uploadedImageUrl = "";
    } catch (error) {
        console.error('Failed to communicate with the backend.', error);
    } finally {
        toggleLoader(false); // Hide the loader after receiving the response or in case of an error
    }
}



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
    toggleLoader(true); // Show the loader
    try {
        const response = await fetch(endpoint, fetchOptions);
        const data = await response.json();

        const newMessage = `Gemini: ${data.text}`;
        const formattedMessage = marked.parse(newMessage); // Assuming you are using Marked.js for markdown parsing
        bottomLeftMessageHistory.push(formattedMessage);
        updateBottomLeftArea();

        appendMessageToDiscussionContainer(formattedMessage, "Gemini");
    } catch (error) {
        console.error('Failed to communicate with the Gemini backend.', error);
    } finally {
        toggleLoader(false); // Hide the loader
    }
}



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
    toggleLoader(true); // Show the loader
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

                appendMessageToDiscussionContainer(formattedMessage, "Claude");
            } catch (error) {
                console.error('Failed to communicate with Claude Image API.', error);
            } finally {
                toggleLoader(false); // Hide the loader
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

            appendMessageToDiscussionContainer(formattedMessage, "Claude");
        } catch (error) {
            console.error('Failed to communicate with the Claude API.', error);
        } finally {
            toggleLoader(false); // Hide the loader
        }
    }
}



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



function appendMessageToDiscussionContainer(message, botName) {
    const discussionContainer = document.getElementById('discussionContainer');
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message;

    // change text color by botName
    switch (botName) {
        case "ChatGPT":
            messageDiv.style.color = "#80A79D"; // Color for ChatGPT 
            break;
        case "Claude":
            messageDiv.style.color = "#CC7C5E"; // Color for Claude 
            break;
        case "Gemini":
            messageDiv.style.color = "#5889D0"; // Color for Gemini
            break;
        default:
            // default color for all others.
            messageDiv.style.color = "#F8F8F8";
            break;
    }

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
                shouldRemoveImageOnNextSend = false; // Reset the flag when a new image is uploaded
                const base64EncodedImage = e.target.result; // This is your base64-encoded image
                document.getElementById('linkInput').value = base64EncodedImage; // Assuming you want to use the same input to hold the base64 string
                
                // Call uploadFile function right after setting the preview
                //uploadFile();
                // Create and append the X emoji 04042024.
                const xEmoji = document.createElement('span');
                xEmoji.textContent = '❌'; // X emoji
                xEmoji.classList.add('x-emoji');
                xEmoji.onclick = function() {
                    /*
                    preview.src = ''; // Remove image source
                    preview.style.display = 'none'; // Hide the image
                    previewContainer.removeChild(xEmoji); // Remove the X emoji itself
                    // Clear the file input
                    document.getElementById('fileInput').value = '';

                    // Clear the textarea
                    document.getElementById('linkInput').value = '';

                    // Optionally, hide the textarea if it's meant to be toggled with the link button
                    document.getElementById('linkInput').style.display = 'none';
                    */
                    clearImage();
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

