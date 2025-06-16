// components/ImageWithFallback.tsx
import { useState } from 'react';
import Image from 'next/image';

type ImageWithFallbackProps = {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onClick?: () => void;
};

const ImageWithFallback = ({
  src,
  alt,
  width,
  height,
  className,
  onClick,
}: ImageWithFallbackProps) => {
  return (
    <Image
      src={src || "/fallback-image.png"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
    />
  );
};

export default ImageWithFallback;
