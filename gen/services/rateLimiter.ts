
// --- BACKEND DISCONNECTED ---
// The rate limiter has been disabled for offline mode.
// All API calls will be allowed without checking a database.

/**
 * Checks if a user has exceeded their API usage limit.
 * In offline mode, this always returns true.
 */
export async function checkApiUsageLimit(userId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Always allow API calls in the disconnected, local version.
  return { allowed: true };
}
