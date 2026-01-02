
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  getFinancialInsights: async (transactions: Transaction[]): Promise<AIInsight | null> => {
    try {
      const summaryData = transactions.map(t => ({
        t: t.title,
        a: t.amount,
        c: t.category,
        d: t.date,
        ty: t.type
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these financial transactions and provide insights: ${JSON.stringify(summaryData)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "One paragraph summarizing spending habits." },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific actionable tips." },
              savingsPotential: { type: Type.STRING, description: "Estimated potential monthly savings amount with reasoning." }
            },
            required: ["summary", "recommendations", "savingsPotential"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
      return null;
    } catch (error) {
      console.error("AI Insight Error:", error);
      return null;
    }
  },

  suggestCategory: async (title: string): Promise<Category> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the transaction title "${title}", categorize it into one of: ${Object.values(Category).join(', ')}. Return only the category name.`,
      });
      
      const suggestion = response.text.trim() as Category;
      return Object.values(Category).includes(suggestion) ? suggestion : Category.OTHER;
    } catch (error) {
      return Category.OTHER;
    }
  }
};
