import { supabase, IMAGES_BUCKET } from '../config/supabase.js';
import { compressImage, CompressionOptions } from './imageCompressionService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Folder types for organizing images
 */
export type ImageFolder = 'chat' | 'machines' | 'videos';

/**
 * Upload an image to Supabase Storage
 * @param base64Image - Base64 encoded image string
 * @param folder - Folder to store the image in
 * @param options - Compression options
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
    base64Image: string,
    folder: ImageFolder,
    options: CompressionOptions = {}
): Promise<string> {
    try {
        // Compress image
        const compressedBuffer = await compressImage(base64Image, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 80,
            format: 'jpeg',
            ...options
        });

        // Generate unique filename
        const fileName = `${folder}/${uuidv4()}.jpg`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(IMAGES_BUCKET)
            .upload(fileName, compressedBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '3600', // Cache for 1 hour
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(IMAGES_BUCKET)
            .getPublicUrl(fileName);

        console.log(`✅ Image uploaded successfully: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Delete an image from Supabase Storage
 * @param url - Public URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
    try {
        // Extract file path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/nespresso-images/chat/uuid.jpg
        const urlParts = url.split(`/${IMAGES_BUCKET}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid image URL format');
        }

        const filePath = urlParts[1];

        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from(IMAGES_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }

        console.log(`🗑️  Image deleted successfully: ${filePath}`);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

/**
 * Check if Supabase Storage is configured
 * @returns true if configured, false otherwise
 */
export function isStorageConfigured(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}
