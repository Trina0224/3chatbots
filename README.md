# 3chatbots
 shabe shabe no robots

At the current stage, we can have humans, ChatGPT, Gemini, and Claude chat together on the four corners of the screen.  
現在の段階では、画面の四隅で人間、ChatGPT、Gemini、Claudeが一緒にチャットできます。  
目前進度，可以在畫面上四個角落分別讓人類，ChatGPT, Gemini與Claude一起聊天。



## .env
CHATGPT_API_KEY=  

GEMINI_API_KEY=  

CLAUDE_API_KEY=  



## Environment  
npm install @google/generative-ai  
npm install openai  
npm install @anthropic-ai/sdk  


## Run  
Linux or Mac:  
node ./server.js  
Windows:  
node .\server.js  
  
##  Note  
03/24/2024 Initial Draft.  
03/25/2024 Integrated Claude.  

## To Do  
1. Control the talking sequence.  
2. Clean codes.  
3. Provide personality to each of the bots. Need to work on Claude.    
4. Can support markdown format.  
5. Can upload picutre.  
6. Can support hyperlink.  
7. Deco the html and css.  
8. Use timer to keep the discussion.  


## BUG  
1. Empty textarea at top-left will trigger 500 at Gemini section.  




## Demo  
English:  
![Demo 1](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-03-25%20223355.png)  

Chinese:    
![Demo 2](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-03-26%20004357.png)

Japanese:  
![Demo 3](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-03-26%20010348.png)  
