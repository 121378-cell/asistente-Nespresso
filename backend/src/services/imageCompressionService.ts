import sharp from 'sharp';

/**
 * Options for image compression
 */
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress and optimize an image from base64 string
 * @param base64Image - Base64 encoded image string
 * @param options - Compression options
 * @returns Compressed image as Buffer
 */
export async function compressImage(
  base64Image: string,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 80, format = 'jpeg' } = options;

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');

    // Create sharp instance
    let image = sharp(buffer);

    // Resize if needed (maintain aspect ratio, don't enlarge)
    image = image.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Apply format-specific compression
    switch (format) {
      case 'jpeg':
        image = image.jpeg({
          quality,
          progressive: true,
          mozjpeg: true, // Use mozjpeg for better compression
        });
        break;
      case 'png':
        image = image.png({
          quality,
          compressionLevel: 9,
          progressive: true,
        });
        break;
      case 'webp':
        image = image.webp({
          quality,
          effort: 6, // 0-6, higher = better compression but slower
        });
        break;
    }

    // Convert to buffer
    return await image.toBuffer();
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Get metadata from base64 image
 * @param base64Image - Base64 encoded image string
 * @returns Image metadata
 */
export async function getImageMetadata(base64Image: string) {
  try {
    const buffer = Buffer.from(base64Image, 'base64');
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw new Error('Failed to get image metadata');
  }
}
