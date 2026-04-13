export const getOptimizedImageUrl = (url: string, _width: number, _quality: number = 50): string => {
    // Supabase Image Transformations are causing 400 Bad Request (likely Disabled/Free Tier).
    // We return the raw URL so the original image loads safely.
    return url || '';
};
