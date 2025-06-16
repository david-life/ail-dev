// components/DocumentCard/ActionsMenu.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ActionsMenuProps {
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
  similarityScore?: number;
}

export const ActionsMenu = ({ 
  onView, 
  onDownload, 
  onShare, 
  similarityScore 
}: ActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <span className="sr-only">Actions</span>
        {/* Three dots icon */}
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-30
                         border border-gray-200 py-1"
            >
              <button
                onClick={onView}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                View Document
              </button>
              <button
                onClick={onDownload}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                Download
              </button>
              <button
                onClick={onShare}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                Share
              </button>
              {similarityScore && (
                <div className="px-4 py-2 text-sm text-gray-500 border-t">
                  {Math.round(similarityScore * 100)}% match
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
