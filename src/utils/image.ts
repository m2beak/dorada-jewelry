export const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80): string => {
    if (!url) return '';

    // Check if it's a Supabase Storage URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        // If Supabase Image Transformation is enabled (requires Pro plan or addon), 
        // we can use the /render/image/ route or append query params if using a CDN that supports it.
        // Standard Supabase storage direct URLs don't support ?width=x params out of the box without the image service.
        // However, the user explicitly asked for this pattern. 
        // We will assume they are using Supabase's image transformation service or a compatible proxy.

        // Pattern for Supabase Image Transformation:
        // replacing /object/public/ with /render/image/public/ is one way, 
        // OR just appending params if the project is configured for it.

        // Let's implement the standard parameter appending first, as requested.
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
    }

    // Return original for non-Supabase images
    return url;
};
