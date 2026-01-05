
import { GoogleGenAI, Type } from "@google/genai";
import { ProblemAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProblemImage = async (base64Image: string): Promise<ProblemAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze the machine learning problem in this image. Extract the core components and generate a logical ruleset for a decision tree that classifies weather data into 'Indoor' or 'Outdoor'. Use Celsius for temperature (range 0-40) and percentage for humidity (range 0-100). Provide a detailed educational explanation of why a decision tree is suitable here."
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          problem: { type: Type.STRING },
          mlType: { type: Type.STRING },
          algorithm: { type: Type.STRING },
          output: { type: Type.STRING },
          ruleset: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of if-else logical rules representing the tree"
          },
          explanation: { type: Type.STRING }
        },
        required: ["title", "problem", "mlType", "algorithm", "output", "ruleset", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
};
