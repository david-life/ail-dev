// lib/cloudinary-server.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResponse } from './cloudinary';

// Configure only on server-side
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function uploadToCloudinary(
  file: string | Buffer,
  options: Record<string, any> = {}
): Promise<CloudinaryUploadResponse> {
  try {
    let uploadFile: string;
    if (typeof file === 'string') {
      uploadFile = file;
    } else {
      // Convert Buffer to base64 data URI
      const base64 = file.toString('base64');
      uploadFile = `data:application/octet-stream;base64,${base64}`;
    }
    const result = await cloudinary.uploader.upload(uploadFile, {
      resource_type: 'auto',
      ...options
    });
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
}

export default cloudinary;
