// FIX: This file was a placeholder. It has been implemented with all the necessary AI service functions using the Gemini API, resolving multiple import errors across the application.
import { GoogleGenAI, Type } from "@google/genai";
import { coralGenerateContent, coralGenerateImages } from './coralProtocol';
import type { EventPlan, ChatMessage, OpsMindEventDetails, OpsMindBudgetCategory, OpsMindVendor, OpsMindTimeline, CommunityPost } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

const handleApiError = (error: any, context: string): never => {
  console.error(`Error in ${context}:`, error);
  const message = error.message || 'An unexpected error occurred with the AI service.';
  throw new Error(`Failed to ${context}. ${message}`);
};

const safelyParseJson = <T>(jsonString: string, context: string): T => {
    try {
        const cleanedString = jsonString.trim().replace(/^```json\s*|```$/g, '').trim();
        return JSON.parse(cleanedString);
    } catch (error) {
        console.error(`Failed to parse JSON in ${context}:`, jsonString);
        throw new Error(`The AI returned an invalid format for ${context}. Please try again.`);
    }
};

export const generateEventPlan = async (
  eventType: string,
  guestCount: string,
  budget: string,
  location: string,
  vibe: string,
  specialRequests: string
): Promise<EventPlan> => {
    const prompt = `
        You are an expert event planner. Create a detailed event plan based on the following details.
        Your entire response MUST be a single JSON object. Do not include any text or markdown backticks before or after the JSON.

        - Event Type: ${eventType}
        - Guest Count: ${guestCount}
        - Budget: ${budget}
        - Location: ${location}
        - Desired Vibe/Theme: ${vibe}
        - Special Requests: ${specialRequests}

        Provide a realistic, high-quality plan. For the venue, suggest a plausible-sounding but fictional name and address suitable for the specified location. The agenda should have at least 4-5 distinct items.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            eventName: { type: Type.STRING },
            eventDate: { type: Type.STRING, description: "A suggested date or timeframe, e.g., 'Mid-October 2024'" },
            theme: { type: Type.STRING },
            description: { type: Type.STRING },
            venue: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                    description: { type: Type.STRING },
                    website: { type: Type.STRING, description: "A plausible but fictional URL for the venue." },
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
        const result = await coralGenerateContent(ai, {
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });
        return safelyParseJson<EventPlan>(result.text, 'generateEventPlan');
    } catch (error) {
        handleApiError(error, 'generate event plan');
    }
};

export const generateMoodBoard = async (theme: string, description: string): Promise<string[]> => {
    const prompt = `A mood board for an event. Theme: "${theme}". Description: "${description}". The image should be vibrant, professional, and visually appealing, capturing the core essence of the event.`;
    
    const NEBIUS_API_KEY = process.env.VITE_NEBIUS_API_KEY!;

    // Primary logic: Nebius API
    try {
        console.log("Attempting to generate mood board with Nebius API (FLUX.1-schnell)...");
        
        const response = await fetch('https://api.studio.nebius.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEBIUS_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'black-forest-labs/flux-schnell',
                prompt: prompt,
                n: 1,
                response_format: 'b64_json'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(`Nebius service failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        if (result.data && result.data.length > 0 && result.data[0].b64_json) {
            console.log("Nebius image generation successful.");
            // The response contains a base64 string, which matches the expected return type.
            return [result.data[0].b64_json];
        } else {
            throw new Error("Nebius service returned an unexpected response format.");
        }
    } catch (nebiusError) {
        console.warn("Nebius image generation failed. Attempting fallback with Gemini...", nebiusError);
        // Fallback logic: Gemini API
        try {
            console.log("Attempting to generate mood board with Gemini...");
            const result = await coralGenerateImages(ai, {
                model: 'imagen-4.0-generate-001',
                prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9'
                },
            });
            console.log("Gemini mood board generation successful.");
            return result.generatedImages.map(img => img.image.imageBytes);
        } catch (geminiError) {
            console.error("Fallback Gemini image generation also failed.", geminiError);
            // If both fail, throw a comprehensive error to be handled by the UI.
            // This will trigger the manual URL input.
            handleApiError(geminiError, 'generate mood board');
        }
    }
};

export const refineEventPlan = async (eventPlan: EventPlan, request: string): Promise<EventPlan> => {
    const prompt = `
      Given the following JSON event plan, update it based on this request: "${request}".
      Return the entire updated event plan as a single JSON object.
      Ensure the output is only the JSON object, with no extra text or markdown.
      
      Current Plan:
      ${JSON.stringify(eventPlan, null, 2)}
    `;

    // FIX: The previous empty schema caused an API error. This full schema ensures the AI returns a valid structure.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            eventName: { type: Type.STRING },
            eventDate: { type: Type.STRING },
            theme: { type: Type.STRING },
            description: { type: Type.STRING },
            venue: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                    description: { type: Type.STRING },
                    website: { type: Type.STRING },
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
            teamNotes: { type: Type.STRING, description: "Internal notes for the planning team." }
        },
        required: ['eventName', 'eventDate', 'theme', 'description', 'venue', 'agenda']
    };
    
    try {
        const result = await coralGenerateContent(ai, {
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema
            }
        });
        return safelyParseJson<EventPlan>(result.text, 'refineEventPlan');
    } catch (error) {
        handleApiError(error, 'refine event plan');
    }
};

export const chatWithAgent = async (eventPlan: EventPlan, history: ChatMessage[], userInput: string): Promise<{ responseText: string; actionableRequestIdentified: boolean, originalUserPrompt?: string }> => {
    const prompt = `
        You are an AI assistant helping a user refine their event plan.
        Analyze the user's latest message in the context of the conversation history and the current event plan.

        Current Event Plan: ${JSON.stringify(eventPlan, null, 2)}
        Conversation History: ${JSON.stringify(history)}
        User's Latest Message: "${userInput}"

        Your task is to decide if the user's message is a direct, actionable command to modify the plan (e.g., "change the theme to cyberpunk", "add a keynote speaker at 10 AM", "make the venue bigger").
        - If it IS an actionable command, your response should be a confirmation to proceed. For example: "I can certainly do that. Shall I go ahead and update the plan?"
        - If it is NOT an actionable command (e.g., it's a question, a greeting, or a general comment), provide a helpful, conversational response.

        Your entire response MUST be a single JSON object with two keys:
        1. "responseText": Your string reply to the user.
        2. "actionableRequestIdentified": A boolean. Set to true if it's a modification command, otherwise false.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            responseText: { type: Type.STRING },
            actionableRequestIdentified: { type: Type.BOOLEAN },
        },
        required: ['responseText', 'actionableRequestIdentified'],
    };

    try {
        const result = await coralGenerateContent(ai, {
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });
        const parsed = safelyParseJson<{ responseText: string; actionableRequestIdentified: boolean }>(result.text, 'chatWithAgent');
        return {...parsed, originalUserPrompt: userInput};
    } catch (error) {
        handleApiError(error, 'chat with agent');
    }
};

export const generateBudgetPlan = async (details: OpsMindEventDetails): Promise<OpsMindBudgetCategory[]> => {
    const prompt = `
        Create a budget plan for an event with these details: ${JSON.stringify(details)}.
        Allocate the total budget across relevant categories.
        For each category, provide the category name, amount, percentage of total budget, and a brief note on potential "trade-offs" if the budget for this category were to be reduced.
        Return the response as a JSON array of objects.
    `;
    const responseSchema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                category: { type: Type.STRING }, amount: { type: Type.NUMBER },
                percentage: { type: Type.NUMBER }, tradeOffs: { type: Type.STRING },
            }, required: ['category', 'amount', 'percentage', 'tradeOffs']
        }
    };
    try {
        const result = await coralGenerateContent(ai, { model, contents: prompt, config: { responseMimeType: 'application/json', responseSchema }});
        return safelyParseJson<OpsMindBudgetCategory[]>(result.text, 'generateBudgetPlan');
    } catch (error) {
        handleApiError(error, 'generate budget plan');
    }
};

export const findVendors = async (details: OpsMindEventDetails, budget: OpsMindBudgetCategory[]): Promise<OpsMindVendor[]> => {
    const prompt = `
        For an event with details: ${JSON.stringify(details)} and budget: ${JSON.stringify(budget)},
        suggest key vendor categories to consider. For each category, provide a professional tip for finding/managing them and a specific note on how the budget might influence the choice.
        Return as a JSON array of objects.
    `;
    const responseSchema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                category: { type: Type.STRING }, description: { type: Type.STRING },
                budgetNote: { type: Type.STRING },
            }, required: ['category', 'description', 'budgetNote']
        }
    };
    try {
        const result = await coralGenerateContent(ai, { model, contents: prompt, config: { responseMimeType: 'application/json', responseSchema }});
        return safelyParseJson<OpsMindVendor[]>(result.text, 'findVendors');
    } catch (error) {
        handleApiError(error, 'find vendors');
    }
};

export const generateEventTimeline = async (details: OpsMindEventDetails): Promise<OpsMindTimeline> => {
    const prompt = `
        Generate a strategic event timeline and detailed agenda for an event with these details: ${JSON.stringify(details)}.
        Start with a brief "summary" of the guest flow strategy. Then provide an "agenda" as an array of objects with time, title, and description.
        Return a single JSON object.
    `;
    const responseSchema = {
        type: Type.OBJECT, properties: {
            summary: { type: Type.STRING },
            agenda: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        time: { type: Type.STRING }, title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    }, required: ['time', 'title', 'description']
                }
            }
        }, required: ['summary', 'agenda']
    };
    try {
        const result = await coralGenerateContent(ai, { model, contents: prompt, config: { responseMimeType: 'application/json', responseSchema }});
        return safelyParseJson<OpsMindTimeline>(result.text, 'generateEventTimeline');
    } catch (error) {
        handleApiError(error, 'generate event timeline');
    }
};

export const generateCommunityPosts = async (count: number): Promise<Omit<CommunityPost, 'id' | 'imageUrl'>[]> => {
    const prompt = `
        You are a creative director for a community of event planners. Generate ${count} diverse and inspiring mock community posts.
        For each post, invent a realistic planner (name, title) and a compelling event plan.
        Make the event plans varied: corporate, creative, personal, large, small, etc.
        Return a JSON array of objects.
    `;

    const eventPlanSchema = {
        type: Type.OBJECT,
        properties: {
            eventName: { type: Type.STRING },
            eventDate: { type: Type.STRING },
            theme: { type: Type.STRING },
            description: { type: Type.STRING },
            venue: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, address: { type: Type.STRING }, description: { type: Type.STRING }, website: { type: Type.STRING } },
                required: ['name', 'address', 'description']
            },
            agenda: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { time: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ['time', 'title', 'description']
                }
            },
        },
        required: ['eventName', 'eventDate', 'theme', 'description', 'venue', 'agenda']
    };

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                author: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, title: { type: Type.STRING } },
                    required: ['name', 'title']
                },
                timestamp: { type: Type.STRING, description: "A relative time like '2 hours ago' or 'Yesterday'" },
                plan: eventPlanSchema,
                likes: { type: Type.INTEGER },
                comments: { type: Type.INTEGER }
            },
            required: ['author', 'timestamp', 'plan', 'likes', 'comments']
        }
    };

    try {
        const result = await coralGenerateContent(ai, { model, contents: prompt, config: { responseMimeType: 'application/json', responseSchema }});
        return safelyParseJson<Omit<CommunityPost, 'id' | 'imageUrl'>[]>(result.text, 'generateCommunityPosts');
    } catch (error) {
        handleApiError(error, 'generate community posts');
    }
};