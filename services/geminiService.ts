import { GoogleGenAI, Type } from "@google/genai";
import { Department, EventType } from "../types";
import { PRODUCT_LIST } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

export const GeminiService = {
  /**
   * Parses natural language into a structured task object based on new schema.
   */
  parseTask: async (input: string): Promise<{ department: Department, eventType: EventType, product?: string, description: string, hours: number } | null> => {
    if (!process.env.API_KEY) return null;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Parse this work log entry into JSON for a Taiwan corporate system. 
        Input: "${input}". 
        
        Fields to extract:
        1. Department (Must be one of: ${Object.values(Department).join(', ')}). Infer best fit.
        2. EventType (Must be one of: ${Object.values(EventType).join(', ')}). Infer best fit.
        3. Product (Must be one of: ${PRODUCT_LIST.join(', ')}). If not found or not mentioned, return empty string.
        4. Description (String). The details.
        5. Hours (Number). If 30 min, return 0.5. Default 0.25.

        Return JSON matching this schema exactly.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              department: { type: Type.STRING, enum: Object.values(Department) },
              eventType: { type: Type.STRING, enum: Object.values(EventType) },
              product: { type: Type.STRING },
              description: { type: Type.STRING },
              hours: { type: Type.NUMBER },
            },
            required: ["department", "eventType", "description", "hours"],
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Parse Error:", error);
      return null;
    }
  },

  /**
   * Generates a daily summary.
   */
  generateDailyInsight: async (tasks: any[]): Promise<string> => {
    if (!process.env.API_KEY || tasks.length === 0) return "No tasks to analyze.";

    try {
      const taskSummary = tasks.map(t => `${t.hours}h [${t.department}-${t.eventType}]: ${t.description}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze these daily work logs. Provide a 2-sentence summary in Traditional Chinese (繁體中文) encouraging the user.
        Logs:
        ${taskSummary}`,
      });

      return response.text || "辛苦了！今天的紀錄已保存。";
    } catch (error) {
      console.error