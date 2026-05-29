import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_BUCKET = 'product-images';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucketName - The storage bucket to upload to
 * @returns The public URL of the uploaded image
 * @throws Error if upload fails
 */
export const uploadImageToStorage = async (file: File, bucketName: string = DEFAULT_BUCKET): Promise<string> => {
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
    }

    // Ensure target bucket exists
    await ensureBucketExists(bucketName);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
        .from(bucketName)
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
        .from(bucketName)
        .getPublicUrl(filePath);

    return publicUrl;
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 * @param bucketName - Optional bucket name (attempts to detect from URL if not provided)
 * @returns true if successful
 */
export const deleteImageFromStorage = async (imageUrl: string, bucketName?: string): Promise<boolean> => {
    try {
        // Detect bucket name from URL if not explicitly provided
        let targetBucket = bucketName || DEFAULT_BUCKET;
        if (!bucketName) {
            if (imageUrl.includes('jewelry-assets')) {
                targetBucket = 'jewelry-assets';
            } else if (imageUrl.includes('product-images')) {
                targetBucket = 'product-images';
            }
        }

        // Extract file path from URL
        const urlParts = imageUrl.split(`${targetBucket}/`);
        if (urlParts.length < 2) {
            console.warn('Invalid image URL format');
            return false;
        }

        const filePath = urlParts[1].split('?')[0]; // Remove query params

        const { error } = await supabase.storage
            .from(targetBucket)
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
 * Ensure a specific bucket exists and is public
 * @param bucketName - Name of the bucket
 */
export const ensureBucketExists = async (bucketName: string = DEFAULT_BUCKET): Promise<void> => {
    try {
        const { data: buckets } = await supabase.storage.listBuckets();

        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

        if (!bucketExists) {
            const { error } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
            });

            if (error) {
                console.error(`Error creating bucket ${bucketName}:`, error);
            }
        }
    } catch (err) {
        console.error(`Error checking bucket ${bucketName}:`, err);
    }
};
