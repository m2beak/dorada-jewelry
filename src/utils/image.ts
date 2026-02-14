export const getOptimizedImageUrl = (url: string, width: number, quality: number = 50): string => {
    if (!url) return '';

    // Check if it's a Supabase Storage URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
    }

    // Return original for non-Supabase images
    return url;
};
