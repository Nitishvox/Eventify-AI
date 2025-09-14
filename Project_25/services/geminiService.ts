import { GoogleGenAI, Type } from "@google/genai";
import type { EventPlan, ChatMessage, AgentResponse, OpsMindBudgetCategory, OpsMindEventDetails, OpsMindGuestFlowAnalysis, OpsMindVendor } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const handleApiError = (error: any): never => {
  console.error(`Error calling Gemini API:`, error);

  let isQuotaError = false;
  const genericError = "Failed to get a response from the AI. The model may be overloaded or the prompt is too restrictive.";
  const quotaError = "The service is currently experiencing high traffic. Please try again in a few moments.";
  const apiKeyError = "Invalid or missing API Key. Please check your environment variables.";

  const errorString = JSON.stringify(error);
  if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('quota')) {
    isQuotaError = true;
  }
  if (error?.error?.code === 429 || error?.error?.status === 'RESOURCE_EXHAUSTED') {
    isQuotaError = true;
  }
  if (error instanceof Error) {
    if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
      isQuotaError = true;
    }
    if (error.message.includes("API_KEY")) {
      throw new Error(apiKeyError);
    }
  }
  
  if (isQuotaError) {
    throw new Error(quotaError);
  }
  
  if (error instanceof SyntaxError) {
      throw new Error("The AI model returned a malformed response. Please try again with a different prompt.");
  }

  throw new Error(genericError);
};

const responseSchema: any = {
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
 * Generates a detailed event plan using AI.
 */
export const generateEventPlan = async (
    eventType: string,
    guestCount: string,
    budget: string,
    location: string,
    vibe: string,
    specialRequests: string,
): Promise<EventPlan> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert event planner. Create a detailed, actionable, and creative event plan based on the user's request.
    Based on your knowledge, suggest a suitable, real-world venue in the specified location. Provide its name, address, website (if available), and a brief description.
    Generate a logical agenda with specific timings and engaging descriptions for each item.

    User's Request:
    - Event Type: ${eventType}
    - Number of Guests: ${guestCount}
    - Budget: ${budget}
    - Location: ${location}
    - Desired Vibe/Theme: ${vibe}
    - Special Requests: ${specialRequests || 'None'}

    Your entire response MUST be a single JSON object that conforms to the provided schema. Do not include any text or markdown backticks before or after the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        // FIX: Per @google/genai guidelines, using a response schema to enforce JSON output is not compatible with the googleSearch tool.
        // The tool has been removed to ensure a reliable JSON response for the event plan.
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });

    const rawText = response.text.trim();
    // FIX: The model sometimes wraps the JSON in markdown. Clean it before parsing.
    const cleanedText = rawText.replace(/^```json\s*|```$/g, '').trim();
    return JSON.parse(cleanedText) as EventPlan;
  } catch (error) {
    handleApiError(error);
  }
};


/**
 * Generates a visual mood board for an event.
 */
export const generateMoodBoard = async (eventTheme: string, eventDescription: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A vibrant, high-quality, cinematic hero image that captures the essence of the following event: Theme: "${eventTheme}". Description: "${eventDescription}". The image should be visually stunning and suitable for a header.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        return response.generatedImages.map(img => img.image.imageBytes);
    } catch (error) {
        handleApiError(error);
    }
};

const agentResponseSchema: any = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "The conversational text to show to the user." },
        actionableRequestIdentified: { type: Type.BOOLEAN, description: "Set to true ONLY if the user makes a specific request to change the plan." },
        originalUserPrompt: { type: Type.STRING, description: "If actionableRequestIdentified is true, this MUST contain the user's original request." },
    },
    required: ['responseText', 'actionableRequestIdentified'],
};

/**
 * Acts as a conversational agent to chat about and identify changes for an event plan.
 */
export const chatWithAgent = async (
    currentPlan: EventPlan,
    chatHistory: ChatMessage[],
    newUserRequest: string
): Promise<AgentResponse> => {
    const model = 'gemini-2.5-flash';
    // Take only the last 6 messages to keep the context focused and the prompt size reasonable
    const historyForPrompt = chatHistory.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');

    const prompt = `
        You are a helpful and conversational AI event planning assistant. Your goal is to chat with the user about their event plan and help them refine it.

        You have two modes:
        1.  **Answering Mode:** If the user asks a question about the plan (e.g., "what is the theme?"), makes a general comment, or just says hello, you MUST provide a friendly, conversational response. In this mode, "actionableRequestIdentified" MUST be false.
        2.  **Proposing Mode:** If the user makes a specific, actionable request to CHANGE the plan (e.g., "change the theme to rustic," "add a coffee break," "find a cheaper venue"), you MUST first confirm this with the user. Summarize their request in your own words in the 'responseText' and ask if they want to proceed. In this mode, "actionableRequestIdentified" MUST be true, and you must include the user's original request in "originalUserPrompt".

        **Current Event Plan (for context):**
        ${JSON.stringify(currentPlan, null, 2)}

        **Recent Conversation History:**
        ${historyForPrompt}
        
        **New User Message:**
        "${newUserRequest}"

        Analyze the New User Message and respond in the correct mode.
        Your entire response MUST be a single JSON object that conforms to the provided schema. Do not include any text or markdown backticks before or after the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: agentResponseSchema,
            },
        });

        const rawText = response.text.trim();
        const cleanedText = rawText.replace(/^```json\s*|```$/g, '').trim();
        const agentResponse = JSON.parse(cleanedText) as AgentResponse;
        
        if (agentResponse.actionableRequestIdentified && !agentResponse.originalUserPrompt) {
            agentResponse.originalUserPrompt = newUserRequest;
        }
        return agentResponse;
    } catch (error) {
        handleApiError(error);
    }
};


/**
 * Refines an existing event plan based on user feedback via chat.
 */
export const refineEventPlan = async (currentPlan: EventPlan, userRequest: string): Promise<EventPlan> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are an expert event planner. A user wants to modify an existing event plan.
        Analyze the user's request and update the provided JSON event plan accordingly.
        Return the COMPLETE, UPDATED event plan as a single JSON object.
        Your entire response MUST be a single JSON object that conforms to the provided schema. Do not include any text or markdown backticks before or after the JSON.

        Current Event Plan (JSON):
        ${JSON.stringify(currentPlan)}

        User's Change Request:
        "${userRequest}"
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });
        const rawText = response.text.trim();
        // FIX: The model sometimes wraps the JSON in markdown. Clean it before parsing.
        const cleanedText = rawText.replace(/^```json\s*|```$/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        handleApiError(error);
    }
};


// --- OpsMind AI Functions ---

export const generateBudgetPlan = async (details: OpsMindEventDetails): Promise<OpsMindBudgetCategory[]> => {
  const { totalBudget, guestCount, eventType, priorities, currency, description, duration } = details;

  const prompt = `You are OpsMind AI, a strategic COO for event planning. Given an event with a total budget of ${currency} ${totalBudget}, ${guestCount} guests, of type '${eventType}', lasting ${duration} hours, with priorities on '${priorities.join(', ')}', create a dynamic budget allocation. Event Description: "${description}". Provide actionable trade-off suggestions for each category. Ensure the total allocated budget matches the total budget provided.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'The name of the budget category (e.g., Venue, Catering).' },
            amount: { type: Type.NUMBER, description: `The allocated amount in ${currency}.` },
            percentage: { type: Type.NUMBER, description: 'The percentage of the total budget.' },
            tradeOffs: { type: Type.STRING, description: 'A suggestion for saving money or a reason for the allocation.' },
          },
          required: ['category', 'amount', 'percentage', 'tradeOffs'],
        },
      },
    },
  });
  
  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr);
};


export const findVendors = async (eventDetails: OpsMindEventDetails, budgetPlan: OpsMindBudgetCategory[]): Promise<Record<string, OpsMindVendor[]>> => {
  const { eventType, description, duration, currency } = eventDetails;

  const budgetInfo = budgetPlan.map(c => `${c.category}: ${currency} ${c.amount}`).join(', ');
  const prompt = `As OpsMind AI, find vendors for a '${eventType}' event lasting ${duration} hours. Event Description: "${description}". The budget details are: ${budgetInfo}. For each relevant category, suggest 2-3 fictional vendors with a 1-5 star rating, a brief description of their specialty, and a key negotiation point. Focus on Venue, Catering, and Entertainment.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          Venue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                description: { type: Type.STRING },
                negotiationPoint: { type: Type.STRING },
              },
              required: ['name', 'rating', 'description', 'negotiationPoint'],
            },
          },
          Catering: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                description: { type: Type.STRING },
                negotiationPoint: { type: Type.STRING },
              },
              required: ['name', 'rating', 'description', 'negotiationPoint'],
            },
          },
          Entertainment: {
             type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                description: { type: Type.STRING },
                negotiationPoint: { type: Type.STRING },
              },
              required: ['name', 'rating', 'description', 'negotiationPoint'],
            },
          },
        },
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr);
};


export const simulateGuestFlow = async (eventDetails: OpsMindEventDetails, timeline: string): Promise<OpsMindGuestFlowAnalysis> => {
  const { guestCount, description, duration } = eventDetails;
  const prompt = `As OpsMind AI, analyze the following event timeline for potential guest engagement bottlenecks for an event with ${guestCount} guests, lasting ${duration} hours. Event Description: "${description}". \n\nTimeline:\n${timeline}\n\nIdentify specific moments of friction or low engagement. Provide a summary and a list of bottlenecks with timestamps, the specific issue, and a concrete suggestion for improvement.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: 'An overall summary of the guest flow analysis.' },
          bottlenecks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: 'Timestamp or event phase (e.g., 7:00 PM - Arrival).' },
                issue: { type: Type.STRING, description: 'The potential problem or bottleneck.' },
                suggestion: { type: Type.STRING, description: 'A concrete suggestion to improve the experience.' },
              },
              required: ['time', 'issue', 'suggestion'],
            },
          },
        },
        required: ['summary', 'bottlenecks'],
      },
    },
  });
  
  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr);
};
