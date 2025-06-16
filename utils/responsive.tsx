import React, { useState } from 'react';
import { animate, motion } from 'framer-motion';
import { a } from '@upstash/redis/zmscore-CjoCv9kz';
import { url } from 'inspector';
import { initial } from 'lodash';
import { exit, title } from 'process';
interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="absolute inset-0 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur px-4 py-2 rounded-t-lg">
          <h2 className="font-display font-medium truncate" title={title}>{title}</h2>
          <div className="flex items-center space-x-2">
            <a
              href={url}
              download
              className="text-primary hover:underline text-sm"
              aria-label={`Download ${title}`}
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close PDF viewer"
            >
              ×
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-white rounded-b-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          )}
          <iframe
            src={`${url}#toolbar=0`}
            className="w-full h-full"
            title={title}
            aria-label={title}
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </motion.div>
  );
}