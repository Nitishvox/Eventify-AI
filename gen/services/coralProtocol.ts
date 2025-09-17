
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse, GenerateImagesParameters, GenerateImagesResponse } from "@google/genai";
import { incrementCoralPoints } from './coralService';
import { checkApiUsageLimit } from './rateLimiter';

const CORAL_PROTOCOL_ENABLED = true;
const CORAL_FAILURE_RATE = 0.0; 

const simulateCoralAttempt = (): boolean => {
    if (!CORAL_PROTOCOL_ENABLED) {
        return false;
    }
    const success = Math.random() > CORAL_FAILURE_RATE;
    if (success) {
        console.log("%cCoral Protocol: Communication successful.", "color: #4CAF50; font-weight: bold;");
    } else {
        console.error("%cCoral Protocol: Communication failed (simulated).", "color: #F44336; font-weight: bold;");
    }
    return success;
}

const performRateLimitedApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    // In offline mode, we use a static user ID for rate limiting and points.
    const user = { id: 'local-user' };
    
    if (!user) {
        throw new Error("You must be logged in to use this feature.");
    }

    const { allowed, retryAfter } = await checkApiUsageLimit(user.id);

    if (!allowed && retryAfter) {
        const waitMinutes = Math.ceil((retryAfter - Date.now()) / 60000);
        throw new Error(`Usage limit reached. Please try again in ${waitMinutes} minutes.`);
    }

    const result = await apiCall();
    
    // This is fired after the call succeeds
    incrementCoralPoints(user.id);

    return result;
}


export const coralGenerateContent = async (
  ai: GoogleGenAI,
  params: GenerateContentParameters
): Promise<GenerateContentResponse> => {
  return performRateLimitedApiCall(async () => {
    if (simulateCoralAttempt()) {
      return ai.models.generateContent(params);
    }
    console.warn("%cFallback: Using direct communication channel.", "color: #FFC107;");
    return ai.models.generateContent(params);
  });
};


export const coralGenerateImages = async (
  ai: GoogleGenAI,
  params: GenerateImagesParameters
): Promise<GenerateImagesResponse> => {
   return performRateLimitedApiCall(async () => {
        if (simulateCoralAttempt()) {
            return ai.models.generateImages(params);
        }
        console.warn("%cFallback: Using direct communication channel for image generation.", "color: #FFC107;");
        return ai.models.generateImages(params);
   });
};
