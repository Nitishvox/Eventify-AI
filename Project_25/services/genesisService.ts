import { GoogleGenAI, Type } from "@google/genai";
import type { Stage, Recommendation, EventPlan } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePlanForStage = async (
  eventIdea: string,
  stage: Stage,
  context: string
): Promise<string> => {
  try {
    const prompt = stage.prompt(eventIdea, context);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text ?? '';
  } catch (error) {
    console.error(`Error generating plan for stage "${stage.title}":`, error);
    throw new Error(`Failed to get a response from the AI for the ${stage.title} stage.`);
  }
};

const recommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A short, catchy title for the innovative feature.",
      },
      description: {
        type: Type.STRING,
        description: "A brief explanation of the feature and its benefits for the event.",
      },
      icon: {
        type: Type.STRING,
        enum: ['Tech', 'Experience', 'Engagement'],
        description: "The category of the feature. Must be one of: 'Tech', 'Experience', or 'Engagement'.",
      },
    },
    required: ["title", "description", "icon"],
  },
};

export const getFeatureRecommendations = async (
  planContext: string
): Promise<Recommendation[]> => {
  try {
    const prompt = `You are an AI innovation strategist for events. Based on the following event plan, suggest exactly 3 unique and cutting-edge features to enhance it. For each feature, provide a title, a brief description, and categorize it with an icon type. The icon type must be one of 'Tech', 'Experience', or 'Engagement'.

Event Plan:
---
${planContext}
---

Provide your response as a JSON array of objects, adhering to the specified schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
      },
    });

    const jsonString = (response.text ?? '[]').trim();
    if (!jsonString) {
      return [];
    }

    const recommendations = JSON.parse(jsonString) as Recommendation[];

    if (!Array.isArray(recommendations)) {
      throw new Error("AI response is not a valid array.");
    }

    return recommendations;

  } catch (error) {
    console.error("Error generating feature recommendations:", error);
    throw new Error("Failed to get innovative features from the AI. Please try again later.");
  }
};

const eventPlanSchema: any = {
    type: Type.OBJECT,
    properties: {
        eventName: { type: Type.STRING },
        eventDate: { type: Type.STRING, description: "A plausible date for the event, can be relative like 'Next Fall'." },
        theme: { type: Type.STRING },
        description: { type: Type.STRING },
        venue: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                address: { type: Type.STRING, description: "A plausible or suggested address for the venue." },
                description: { type: Type.STRING },
                website: { type: Type.STRING, description: "A suggested website URL, can be fictional if unknown." },
            },
            required: ['name', 'address', 'description'],
        },
        agenda: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                },
                required: ['time', 'title', 'description'],
            },
        },
    },
    required: ['eventName', 'eventDate', 'venue', 'agenda', 'theme', 'description'],
};

/**
 * Converts a markdown event plan from Event Genesis into a structured EventPlan object.
 */
export const structureGenesisPlan = async (planMarkdown: string, eventIdea: string): Promise<EventPlan> => {
  try {
    const prompt = `You are an expert data extraction AI. Your task is to analyze the following comprehensive event plan (in Markdown format) and convert it into a structured JSON object. The original event idea was: "${eventIdea}". Use this idea to fill in any missing high-level details like the event name. If specific details like a date or exact venue address are not mentioned, generate plausible suggestions based on the context of the plan.

Event Plan Markdown:
---
${planMarkdown}
---

Your entire response MUST be a single JSON object that conforms to the provided schema. Do not include any text or markdown backticks before or after the JSON. The eventName should be a creative and fitting title based on the original idea.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: eventPlanSchema,
      },
    });

    const cleanedText = (response.text ?? '{}').trim().replace(/^```json\s*|```$/g, '').trim();
    return JSON.parse(cleanedText) as EventPlan;

  } catch (error) {
    console.error("Error structuring Genesis plan:", error);
    throw new Error("Failed to convert the generated plan into a structured format for saving.");
  }
};


/**
 * Generates a visual mood board for an Event Genesis plan.
 */
export const generateGenesisImage = async (eventIdea: string, eventTheme: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A vibrant, high-quality, cinematic hero image for an event. The core idea is: "${eventIdea}". The overall theme is: "${eventTheme}". The image should be visually stunning and suitable for a dashboard card.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        return response.generatedImages.map(img => img.image.imageBytes);
    } catch (error) {
        console.error("Error generating genesis image:", error);
        throw new Error("Failed to generate a visual for the event.");
    }
};
