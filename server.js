require('dotenv').config();
//import OpenAI from 'openai';
const OpenAI = require('openai');

//import Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

//import Claude
const Anthropic = require('@anthropic-ai/sdk');


const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-pro"});

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

app.use(express.json());
app.use(express.static('public'));

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
        console.log(systemMessageContent);
        const params = {
            model: 'gpt-3.5-turbo', // Adjust model as needed
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
        res.json(chatCompletion);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error communicating with ChatGPT API');
    }
});



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
                maxOutputTokens: 100, // Adjust based on your requirements
            },
        });

        // Send a message to the model and wait for its response
        // It's important to ensure that the logic of your application correctly handles this "model" role response,
        // especially since this is just a placeholder and may not reflect actual use.
        const result = await chat.sendMessage(userPrompt);
        const response = await result.response;
        const text = await response.text(); // Assuming response.text() returns a promise
        
        // Respond to the client with the model's text response
        res.json({ text });
    } catch (error) {
        console.error('Failed to communicate with Gemini API.', error);
        res.status(500).send('Error communicating with Gemini API');
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
        console.log(msg); // Log the message for debugging
        // Respond with the Claude message. Adjust according to the actual structure of `msg`
        //res.json({ text: msg.responses[0].content });
        res.json({ msg });
    } catch (error) {
        console.error('Failed to communicate with Claude API.', error);
        res.status(500).send('Error communicating with Claude API');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
