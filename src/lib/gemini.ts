import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateProductDescription = async (productName: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write an ultra-luxury, mouth-watering marketing description for ${productName}. It is a premium homemade tomato pickle from the billion-dollar international brand 'Royal Tomato Pickle'. Focus on its royal heritage, artisanal craftsmanship, and prestigious taste profile. Speak with an elegant and sophisticated voice.`,
  });
  return response.text;
};

export const chatWithAI = async (message: string, history: any[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
        systemInstruction: "You are the 'Royal AI Ambassador' for 'Royal Tomato Pickle', the world's most prestigious luxury food brand. Your tone is highly sophisticated, helpful, and exclusive. You assist distinguished guests with product selection, heritage inquiries, and culinary expertise in both Bengali and English. Always refer to the brand as 'Royal Tomato Pickle'."
    }
  });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message
  })
  return response.text;
};
