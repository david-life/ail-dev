import { motion } from "framer-motion";

export const DocumentCardSkeleton = () => {
  return (
    <motion.article
      layout
      className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
    >
      {/* Skeleton Thumbnail */}
      <div className="relative aspect-[4/3] bg-gray-200"></div>

      {/* Skeleton Content */}
      <div className="p-4">
        <div className="h-5 bg-gray-300 rounded-md w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded-md w-5/6 mb-4"></div>

        {/* Skeleton Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="h-3 bg-gray-300 rounded-md w-1/4"></div>
          <div className="h-3 bg-gray-300 rounded-md w-1/6"></div>
        </div>
      </div>

      {/* Skeleton Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between">
        <div className="h-4 bg-gray-300 rounded-md w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded-md w-1/4"></div>
      </div>
    </motion.article>
  );
};
