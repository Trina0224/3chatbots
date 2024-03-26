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
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
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

// Endpoint for chatting with Claude
app.post('/chatWithClaude', async (req, res) => {
    const inputMessage = req.body.message;
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
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
