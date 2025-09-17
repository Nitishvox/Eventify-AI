// --- BACKEND DISCONNECTED ---
// The app encountered database schema errors. All Coral Points logic
// has been reverted to use the browser's local storage to ensure
// the application remains functional.
const getPointsKey = (userId: string) => `coral-points-${userId}`;

export const getCoralPoints = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  try {
    const points = localStorage.getItem(getPointsKey(userId));
    return points ? parseInt(points, 10) : 0;
  } catch (e) {
    console.error("Failed to get coral points from local storage", e);
    return 0;
  }
};

export const getTotalCoralPoints = async (): Promise<number> => {
    // This is a simplified simulation for local storage.
    // In a real app, this would be a server-side aggregation.
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('coral-points-')) {
            total += parseInt(localStorage.getItem(key) || '0', 10);
        }
    }
    return total;
};


export const incrementCoralPoints = async (userId: string) => {
  if (!userId) return;
  try {
    const currentPoints = await getCoralPoints(userId);
    localStorage.setItem(getPointsKey(userId), String(currentPoints + 1));
    // Dispatch event for UI to reactively update (like in VisualisationsPage)
    window.dispatchEvent(new CustomEvent('coralPointsUpdated'));
  } catch (e) {
    console.error("Failed to increment coral points in local storage", e);
  }
};