import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'product-images';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 * @throws Error if upload fails
 */
export const uploadImageToStorage = async (file: File): Promise<string> => {
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(`فشل رفع الصورة: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrl;
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 * @returns true if successful
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
    try {
        // Extract file path from URL
        const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length < 2) {
            console.warn('Invalid image URL format');
            return false;
        }

        const filePath = urlParts[1].split('?')[0]; // Remove query params

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Error deleting image:', err);
        return false;
    }
};

/**
 * Ensure the product-images bucket exists
 * This should be called on app initialization or first upload
 */
export const ensureBucketExists = async (): Promise<void> => {
    try {
        const { data: buckets } = await supabase.storage.listBuckets();

        const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

        if (!bucketExists) {
            const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
            });

            if (error) {
                console.error('Error creating bucket:', error);
            }
        }
    } catch (err) {
        console.error('Error checking bucket:', err);
    }
};
