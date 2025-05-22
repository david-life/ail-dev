import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CldImage } from "next-cloudinary";
import type { Record } from "@/types/document";
import { format, parseISO } from "date-fns";

import cloudinary from "@/lib/cloudinary"; // Import cloudinary utility functions

interface DocumentCardProps {
  document?: Record; // Make document optional to prevent SSR issues
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Prevent state updates after unmount

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!document) {
    return <p>Loading document...</p>; // Ensure no crashes due to undefined document
  }

  // Handle Date Parsing and Formatting
  const dateValue = document.Date ? parseISO(document.Date) : null;
  const formattedDate =
    dateValue && !isNaN(dateValue.getTime()) ? format(dateValue, "MMM d, yyyy") : "Invalid date";

  // **Preemptively Assign Thumbnail or Fallback**
  const thumbnailUrl = document.publicId
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_200,c_fill/page_1/${document.publicId}.jpg`
    : "/images/fallback-image.jpg"; // Correct path for public folder images

  return (
    <motion.article
      onClick={() => isMounted && setIsExpanded((prev) => !prev)}
      className={`transform transition-all duration-200 hover:shadow-md ${
        isExpanded ? "col-span-2 row-span-2 bg-gray-50" : "bg-white"
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3]">
        {document.publicId ? (
          <CldImage src={thumbnailUrl} alt={`Thumbnail for ${document.title}`} width={300} height={200} className="object-cover" />
        ) : (
          <img src="/images/fallback-image.jpg" alt="Fallback Image" width={300} height={200} className="object-cover" />
        )}

        {/* Similarity Badge */}
        {document.similarity && (
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
            {Math.round(document.similarity * 100)}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-medium text-lg mb-2 line-clamp-2">{document.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{document.description}</p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{document.category}</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <button onClick={() => isMounted && setIsExpanded((prev) => !prev)} className="text-primary text-sm font-medium hover:underline">
            {isExpanded ? "Show less" : "Show more"}
          </button>
          <a href={document.url || "#"} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium hover:underline">
            Open PDF →
          </a>
        </div>
      </div>
    </motion.article>
  );
};
