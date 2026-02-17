
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getEncouragement = async (focus: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is focusing on: ${focus}. Give a one-sentence, highly poetic, encouraging "Zen" quote for a student. Be brief and calm.`,
    });
    return response.text || "Bloom at your own pace.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Focus is the art of seeing with the heart.";
  }
};

export const getAfterSchoolMotivation = async (name: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The student ${name} just came home from school at 12 PM. They are tired but need to start their personal study path. Write a 15-word maximum motivational notification message. Make it feel like a warm welcome home that transitions into focused energy. poeitc and zen.`,
    });
    return response.text?.replace(/"/g, '') || "Welcome home. The world outside was loud; find your strength in the quiet of study.";
  } catch (error) {
    return "Welcome home. Let the afternoon's stillness guide your focus.";
  }
};

export const analyzeReflection = async (vent: string, drainedBy: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The student is drained by: ${drainedBy.join(', ')}. They vented: "${vent}". Provide a gentle 2-sentence empathetic response that validates their feelings and suggests a small mindset shift for tomorrow. Keep it warm and supportive.`,
    });
    return response.text || "Rest now, for you have done enough today. Tomorrow is a new sunrise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Your feelings are valid. Take tonight to recharge.";
  }
};
