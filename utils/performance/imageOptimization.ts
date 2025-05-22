// utils/performance/imageOptimization.ts
import { ImageLoader } from 'next/image';

export const cloudinaryLoader: ImageLoader = ({ src, width, quality = 75 }) => {
  const params = [
    'f_auto',
    'c_limit',
    `w_${width}`,
    `q_${quality}`,
  ];
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${params.join(',')}/${src}`;
};