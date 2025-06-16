import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: false, // Important for file uploads
    maxFileSize: '10mb'
  }
};
