import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';

// Configure Cloudinary globally
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info(`Cloudinary configured for cloud_name: "${env.CLOUDINARY_CLOUD_NAME}", default folder: "${env.CLOUDINARY_FOLDER}"`);
} else {
  logger.warn('Cloudinary credentials not fully configured. Image uploads will fallback to local storage.');
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export class CloudinaryService {
  isConfigured(): boolean {
    return Boolean(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Upload an image file from disk path or Buffer to Cloudinary in the specified folder.
   * Default folder: 'civicpulse'
   */
  async uploadImage(
    filePath: string,
    options?: {
      folder?: string;
      publicId?: string;
      tags?: string[];
    }
  ): Promise<CloudinaryUploadResult> {
    const folder = options?.folder || env.CLOUDINARY_FOLDER || 'civicpulse';

    try {
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        tags: options?.tags || ['civicpulse', 'evidence'],
      };

      if (options?.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      const res: UploadApiResponse = await cloudinary.uploader.upload(filePath, uploadOptions);

      logger.info(`Image uploaded to Cloudinary: ${res.public_id}`, {
        url: res.secure_url,
        folder,
        bytes: res.bytes,
      });

      return {
        secureUrl: res.secure_url,
        publicId: res.public_id,
        format: res.format,
        bytes: res.bytes,
        width: res.width,
        height: res.height,
      };
    } catch (err: any) {
      logger.error('Failed to upload image to Cloudinary:', {
        error: err.message,
        filePath,
      });
      throw err;
    }
  }

  /**
   * Delete an image from Cloudinary by its public ID.
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (err: any) {
      logger.error(`Failed to delete Cloudinary image "${publicId}":`, err);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
