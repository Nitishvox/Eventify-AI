// FIX: This file was a placeholder. It has been implemented with the core AI logic for the Event Genesis feature.
import { GoogleGenAI, Type } from "@google/genai";
import { STAGES } from '../constants/genesisConstants';
import type { Recommendation, EventPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

const handleApiError = (error: any): never => {
  console.error("Error calling Gemini API:", error);
  throw new Error("Failed to get a response from the AI. The model may be overloaded or the API key is invalid.");
};

/**
 * Generates a full event plan, streaming back results for each stage.
 */
export async function* generateFullPlanStream(idea: string): AsyncGenerator<{ stageIndex: number, content: string }> {
  try {
    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i];
      const promptText = `
        Based on the initial event idea: "${idea}", generate the "${stage.title}" section of the event plan.
        Your response should be concise, scannable, and easy to read. Use bullet points for key information. Keep descriptions brief and to the point.
        Focus ONLY on the "${stage.title}" section. Do not repeat information from other sections.
      `;

      const result = await ai.models.generateContent({
        model,
        contents: promptText
      });
      yield { stageIndex: i, content: result.text.trim() };
    }
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Gets innovative feature recommendations based on the event context.
 */
export const getFeatureRecommendations = async (planContext: string): Promise<Recommendation[]> => {
  const prompt = `
    Based on the following event plan, suggest 3 innovative and actionable features to enhance the experience.
    Categorize each suggestion as 'Tech', 'Experience', or 'Engagement'.
    
    Event Plan Context:
    ---
    ${planContext}
    ---
    
    Your entire response MUST be a single JSON object. Do not include any text or markdown backticks before or after the JSON.
  `;
  
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        icon: { type: Type.STRING, enum: ['Tech', 'Experience', 'Engagement'] },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ['icon', 'title', 'description'],
    },
  };

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });

    const cleanedText = response.text.trim().replace(/^```json\s*|```$/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Takes unstructured plan text and converts it into a structured EventPlan JSON object.
 */
export const structureGenesisPlan = async (planContext: string): Promise<EventPlan> => {
    const prompt = `
        You are a data structuring expert. Analyze the following unstructured event plan text and convert it into a structured JSON object that conforms to the provided schema.
        
        Event Plan Text:
        ---
        ${planContext}
        ---

        Extract all the relevant information accurately. For the venue, create a plausible but fictional name, address, and website if not explicitly provided. The agenda should have distinct items with time, title, and description. The eventName should be a catchy title based on the context.
        Your entire response MUST be a single JSON object. Do not include any text or markdown backticks before or after the JSON.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            eventName: { type: Type.STRING },
            eventDate: { type: Type.STRING, description: "A suggested date or timeframe, e.g., 'Late October 2024'" },
            theme: { type: Type.STRING },
            description: { type: Type.STRING, description: "A one or two sentence summary of the event concept." },
            venue: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                    description: { type: Type.STRING },
                    website: { type: Type.STRING, description: "A plausible but fictional URL." },
                },
                required: ['name', 'address', 'description']
            },
            agenda: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ['time', 'title', 'description']
                }
            },
        },
        required: ['eventName', 'eventDate', 'theme', 'description', 'venue', 'agenda']
    };
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const cleanedText = response.text.trim().replace(/^```json\s*|```$/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error structuring Genesis plan:", error);
        handleApiError(error);
    }
};