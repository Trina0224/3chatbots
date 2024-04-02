# 3chatbots
 shabe shabe no robots

At the current stage, we can have humans, ChatGPT, Gemini, and Claude chat together on the four corners of the screen.  
現在の段階では、画面の四隅で人間、ChatGPT、Gemini、Claudeが一緒にチャットできます。  
目前進度，可以在畫面上四個角落分別讓人類，ChatGPT, Gemini與Claude一起聊天。  

The order of the conversation will reference the length of the previous round's conversation, with the person who spoke more in the previous round getting to start first in the new round. In the persona input section, we told the three bots that we added this rule. In theory, they should be able to understand this rule.  
Please refer: compareAndSortOutputLengths() and processAndDisplayData().  

The current observation is that Gemini's political stance is quite left-leaning. Everyone can try it out!  




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
03/30/2024 Fixed some issues and posted to X for sharing.  


## To Do  
1. ~Control the talking sequence.~  
2. Clean codes.  
3. ~Provide personality to each of the bots. Need to work on Claude.~    
4. ~Can support markdown format.~  
5. Can upload a picutre.  
6. Can support a hyperlink.  
7. Deco the html and css.  
8. Use timer to keep the discussion.  
9. ~white out history and hightlight current messages.~  
10. ~Put Disable/Enable Chatbot Funcion.~  



## BUG  
1. ~Empty textarea at top-left will trigger 500 at Gemini section.~  
2. Gemini has limitaion. Have to wait for the pay as you go API Key.  
3. ~Move inputs handling to processAndDisplayData() from sendData().~
4. ~Fix human cannot keep silent issue.~  






## Demo  
English:  
![Demo 1](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-03-30%20152131.png)  

Chinese:    
![Demo 2](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-03-26%20004357.png)

Japanese:  
![Demo 3](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-03-26%20010348.png)  
