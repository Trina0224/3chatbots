require('dotenv').config();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const fetch = require('node-fetch'); // Ensure you are using a version compatible with CommonJS
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path'); // Added to fix the missing import

const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

app.use(express.urlencoded({ limit: '500mb', extended: true })); // Increase URL-encoded body limit
app.use(express.json({ limit: '500mb' })); // Increase JSON body limit
app.use(fileUpload());
app.use(express.json());
app.use(express.static('public'));


// File upload endpoint
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    const uploadedFile = req.files.imageFile; // Adjusted for consistency
    const uploadPath = path.join(__dirname, 'public/uploads', uploadedFile.name);
    
    uploadedFile.mv(uploadPath, function(err) {
        if (err) return res.status(500).send(err);

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${uploadedFile.name}`;
        console.log('File uploaded:', fileUrl);
        res.send({message: 'File uploaded!', url: fileUrl});
    });
});

  
/*app.post('/chat', async (req, res) => {
    try {
        const params = {
            model: 'gpt-3.5-turbo', // Adjust model as needed
            messages: [{
                role: 'user', 
                content: req.body.message // Ensure this matches the incoming request
            }],
        };
        const chatCompletion = await openai.chat.completions.create(params);
        res.json(chatCompletion);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error communicating with ChatGPT API');
    }
});
*/
app.post('/chat', async (req, res) => {
    try {
        // Assuming the textarea content is sent in the request body under "trait1"
        const systemMessageContent = req.body.trait1;
        //console.log(systemMessageContent);
        const params = {
            model: 'gpt-3.5-turbo', // gpt-4-vision-preview, gpt-4-1106-vision-preview Adjust model as needed
            messages: [
                {
                    role: 'system',
                    content: systemMessageContent // Read from the HTML textarea
                },
                {
                    role: 'user', 
                    content: req.body.message // Ensure this matches the incoming request
                }
            ],
        };
        const chatCompletion = await openai.chat.completions.create(params);
        console.log('Received from ChatGPT3:', chatCompletion);
        res.json(chatCompletion);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error communicating with ChatGPT3 API');
    }
});

app.post('/chatWithImage', async (req, res) => {
    const imageUrl = req.body.imageUrl;
    const userText = req.body.userText;
    const systemMessageContent = req.body.trait1; // System message content from client

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: 'system',
                    content: systemMessageContent // System message content
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: userText },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                                detail: "auto" //high, low, auto.
                            }
                        }
                    ]
                }
            ]
        });

        console.log('Received from ChatGPT4:', response.choices[0]);
        res.json(response.choices[0]);
    } catch (error) {
        console.error(error);
        console.log(error.name, error.message);
        res.status(500).send('Error processing image with ChatGPT4 API');
    }
});

/*
app.post('/chatWithUploadFile', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // This assumes the client sends the text as 'userText' in the body
    const userText = req.body.userText;

    // Access the uploaded file via req.files.<inputFieldName>, e.g., req.files.uploadedImage
    const uploadedFile = req.files.uploadedImage;
    const base64Image = uploadedFile.data.toString('base64');
    const mimeType = uploadedFile.mimetype;

    const OPENAI_API_KEY = process.env.CHATGPT_API_KEY;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    const payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": userText // Use the userText from the request body
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": `data:${mimeType};base64,${base64Image}`
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    };
    console.log("I AM HERE");
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        res.send(responseData);
    } catch (error) {
        console.error('Error making API request:', error);
        res.status(500).send('Failed to communicate with OpenAI API');
    }
});
*/


/*
app.post('/generateWithGemini', async (req, res) => {
    try {
        const prompt = req.body.message;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text(); // Assuming response.text() returns a promise
        res.json({ text });
        //console.log(text);
    } catch (error) {
        console.error('Failed to communicate with Gemini API.', error);
        res.status(500).send('Error communicating with Gemini API');
    }
});
*/
app.post('/generateWithGemini', async (req, res) => {
    try {
        const userPrompt = req.body.message;
        const modelResponsePart = req.body.trait2;

        // For a text-only input, assuming you're using a model similar to 'gemini-pro'
        //gemini-1.5-pro-latest , gemini-pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Start a chat session with the model, including both the user's prompt and a model's placeholder response in the history
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: userPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: modelResponsePart }], // This is a placeholder; adjust as needed.
                },
            ],
            generationConfig: {
                maxOutputTokens: 1024, // Adjust based on your requirements
            },
        });

        // Send a message to the model and wait for its response
        // It's important to ensure that the logic of your application correctly handles this "model" role response,
        // especially since this is just a placeholder and may not reflect actual use.
        const result = await chat.sendMessage(userPrompt);
        const response = await result.response;
        const text = await response.text(); // Assuming response.text() returns a promise
        
        // Respond to the client with the model's text response
        console.log('Received from Gemini:', text);
        //const text2 = marked(text);
        res.json({ text });
    } catch (error) {
        console.error('Failed to communicate with Gemini API.', error);
        res.status(500).send('Error communicating with Gemini API');
    }
});

app.post('/generateWithGeminiAndImage', async (req, res) => {
    try {
        const userPrompt = req.body.message;
        const modelResponsePart = req.body.trait2;

        // Assuming the image is uploaded and available as req.files.imageFile
        const imageFile = req.files.imageFile; // The 'imageFile' corresponds to the name attribute in the form
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const image = {
            inlineData: {
                data: Buffer.from(imageFile.data).toString("base64"),
                mimeType: imageFile.mimetype,
            },
        };

        const result = await model.generateContent([{ text: userPrompt }, image]);
        console.log('Received from Gemini Vision:', result.response.text());

        res.json({ text: result.response.text() });
    } catch (error) {
        console.error('Failed to communicate with Gemini Vision API.', error);
        res.status(500).send('Error communicating with Gemini Vision API');
    }
});


// Endpoint for chatting with Claude
app.post('/chatWithClaude', async (req, res) => {
    const inputMessage = req.body.message;
    const personalityString = req.body.trait3;
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            system: personalityString,
            max_tokens: 1024,
            messages: [{ role: "user", content: inputMessage }],
        });
        //console.log(msg); // Log the message for debugging
        console.log('Received from Claude:', msg);
        // Respond with the Claude message. Adjust according to the actual structure of `msg`
        //res.json({ text: msg.responses[0].content });
        res.json({ msg });
    } catch (error) {
        console.error('Failed to communicate with Claude API.', error);
        res.status(500).send('Error communicating with Claude API');
    }
});

app.post('/chatWithClaudeImage', async (req, res) => {
    const { image1_media_type, image1_data, inputMessage } = req.body;
    const personalityString = req.body.trait3;

    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            system: personalityString,
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: image1_media_type,
                                data: image1_data,
                            },
                        },
                        {
                            type: "text",
                            text: inputMessage,
                        }
                    ],
                }
            ],
        });
        console.log('Received from Claude Image:', msg);
        res.json({ msg });
    } catch (error) {
        console.error('Failed to communicate with Claude Image API.', error);
        res.status(500).send('Error communicating with Claude Image API');
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

