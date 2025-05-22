// lib/cloudinary.ts
import { CldImage } from 'next-cloudinary';

// Server-side configuration for Cloudinary
if (typeof window === 'undefined') {
  const { v2: cloudinaryServer } = require('cloudinary');
  
  cloudinaryServer.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Client-side Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
};

// Function to generate a Cloudinary URL with transformations
function getCloudinaryUrl(publicId: string, options: Record<string, any> = {}) {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;

  const transformations = Object.entries(options)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  // Ensure proper concatenation of URL without double slashes
  const transformationPart = transformations ? `${transformations}/` : '';
  
  return `${baseUrl}/${transformationPart}${publicId}`;
}

// Utility functions for optimized Cloudinary requests
export const cloudinaryUtils = {
  // Returns the URL for a document with 'auto' format and quality
  getDocumentUrl: (publicId: string) => getCloudinaryUrl(publicId, {
    format: 'auto',
    quality: 'auto',
  }),

  // Returns the URL for a thumbnail with specified dimensions and 'fill' crop mode
  getThumbnailUrl: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 300,
    height: 200,
    crop: 'fill',
    format: 'auto',
    quality: 'auto',
  }),

  // Returns the URL for an optimized image with the specified width and height
  getOptimizedUrl: (publicId: string, width: number, height: number) => getCloudinaryUrl(publicId, {
    width,
    height,
    crop: 'limit',
    format: 'auto',
    quality: 'auto',
  }),

  // Generates a secure download URL for documents (PDFs)
  getSecureDocumentUrl: (publicId: string) => {
    if (!cloudinaryServer) {
      throw new Error('Cloudinary server config is not available in the client-side context.');
    }

    return cloudinaryServer.utils.private_download_url(publicId, "pdf", {
      transformation: [{ flags: "attachment" }],
    });
  }
};

// Types for Cloudinary responses
export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  folder?: string;
}

// Export Cloudinary instance for server-side usage
export const cloudinaryServer = typeof window === 'undefined' 
  ? require('cloudinary').v2 
  : null;

// Export utilities
export default {
  ...cloudinaryUtils,
  config: cloudinaryConfig,
};
