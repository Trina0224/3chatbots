# 3chatbots
 shabe shabe no robots

At the current stage, we can have humans, ChatGPT, Gemini, and Claude chat together on the four corners of the screen.  
現在の段階では、画面の四隅で人間、ChatGPT、Gemini、Claudeが一緒にチャットできます。  
目前進度，可以在畫面上四個角落分別讓人類，ChatGPT, Gemini與Claude一起聊天。  

The order of the conversation will reference the length of the previous round's conversation, with the person who spoke more in the previous round getting to start first in the new round. In the persona input section, we told the three bots that we added this rule. In theory, they should be able to understand this rule.  
Please refer: compareAndSortOutputLengths() and processAndDisplayData().  

The current observation is that Gemini's political stance is quite left-leaning. Everyone can try it out!  

WOW! ChatGPT4 vs 3 is way more expensive!!!  





## .env
CHATGPT_API_KEY=  

GEMINI_API_KEY=  

CLAUDE_API_KEY=  



## Environment  
npm install @google/generative-ai  
npm install openai  
npm install @anthropic-ai/sdk  
npm install express-fileupload  
npm install node-fetch  

npm install  

ps. node-fetch ver. i am usinig "^2.6.1",  




## Run  
Linux or Mac:  
node ./server.js  
Windows:  
node .\server.js  
  
##  Note  
03/24/2024 Initial Draft.  
03/25/2024 Integrated Claude.  
03/30/2024 Fixed some issues and posted to X for sharing.  
04/05/2024 Responsive Viewport  
04/06/2024 index_V1.html, style_V1.css were archived.  
04/13/2024 Almost done.  




## To Do  
1. ~Control the talking sequence.~  
2. Clean codes.  
3. ~Provide personality to each of the bots. Need to work on Claude.~    
4. ~Can support markdown format.~  
5. ~Can upload a picutre.~    
6. Can support a hyperlink.  
7. ~Deco the html and css~  Improving...   
8. ~Use timer to keep the discussion.~ Not Necessary.  
9. ~white out history and hightlight current messages.~  
10. ~Put Disable/Enable Chatbot Funcion.~  
11. ~Add an area for chat in sequencial.~  
12. ~Chat in one container is not so good. have to do some improvement.~    
13. Gemini, Claude cannot read image from hyperlink.    
14. ~Will design photo inputs for Claude.~  
15. ~Claude API always take long time to resposne in the bay area. Can put some waiting hints or something...~    
16. ~Use different colors for different chatbots.~ Only at Discussion in one container mode.  
17. They don't seem to like talking to me much and tend to deliberately ignore some of the things I want to say. They are more interetsed to talk to each other. I will try to do some modification.  






## BUG  
1. ~Empty textarea at top-left will trigger 500 at Gemini section.~  
2. Gemini has limitaion. Have to wait for the pay as you go API Key.  
3. ~Move inputs handling to processAndDisplayData() from sendData().~
4. ~Fix human cannot keep silent issue.~  
5. ~In script.js (search 'BUG'). will fix this after I add the photo function to Gemini and Claude.~    
6. ~Right now, Gemini can read photo. ChatGPT can read link or photo, but the photo size is not idea. A little small. Will try to solve it later.~  
7. ~how to remove the old picture?~  













## Demo  
Personality Settings:  
![Demo 0](https://github.com/Trina0224/3chatbots/blob/main/pics/Screenshot%202024-04-13%20at%207.35.02%E2%80%AFPM.png)  
  
English:  
![Demo 1](https://github.com/Trina0224/3chatbots/blob/main/pics/Default.png)  
  
English (Discussion in one container mode):  
![English Discussion in one container](https://github.com/Trina0224/3chatbots/blob/main/pics/One%20Container.png)  
  
Chinese:    
![Demo 2](https://github.com/Trina0224/3chatbots/blob/main/pics/TWN.png)

Japanese:  
![Demo 3](https://github.com/Trina0224/3chatbots/blob/main/pics/JAP.png)  

## Ref:  
Gemini:[https://ai.google.dev/tutorials/get_started_node#generate-text-from-text-and-image-input]  
ChatGPT:[https://platform.openai.com/docs/guides/vision]  
Claude:[https://docs.anthropic.com/claude/docs/vision]  

