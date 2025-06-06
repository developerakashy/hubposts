import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

async function generatePostFromPrompt(prompt){
    const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
    })
}

export default generatePostFromPrompt
