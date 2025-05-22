// components/PDFViewer/PDFViewer.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.css';
import { CldImage } from "next-cloudinary";


interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
  metadata?: {
    fileSize: number;
    pages: number;
    format: string;
  };
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  title, 
  onClose,
  metadata 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure Cloudinary URLs are correctly formatted
  const cloudinaryBaseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;
  const documentUrl = `${cloudinaryBaseUrl}/${url}`;

  useEffect(() => {
    // Preload PDF with retry mechanism
    const preloadPDF = async (retries = 3) => {
      try {
        const response = await fetch(documentUrl);
        if (!response.ok) throw new Error('Failed to load PDF');
        setLoading(false);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => preloadPDF(retries - 1), 2000); // Retry after 2 sec
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setLoading(false);
        }
      }
    };

    preloadPDF();

    return () => {
      // Cleanup if needed
    };
  }, [documentUrl]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.pdfViewerOverlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={styles.pdfViewerContainer}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h2 className={styles.title}>{title}</h2>
              {metadata && (
                <span className={styles.metadata}>
                  {metadata.pages ?? "Unknown"} pages • {formatFileSize(metadata.fileSize ?? 0)}
                </span>
              )}
            </div>
            <div className={styles.controls}>
              <button
                onClick={() => window.open(documentUrl, '_blank')}
                className={styles.actionButton}
                aria-label="Open in new window"
              >
                <svg className={styles.icon} viewBox="0 0 24 24">
                  <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
              </button>
              <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close viewer"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Loading PDF...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p>{error}</p>
                <a 
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                >
                  Download PDF
                </a>
              </div>
            ) : (
              <object
                data={documentUrl}
                type="application/pdf"
                className={styles.pdfObject}
              >
                <div className={styles.fallback}>
                  <p>
                    Unable to display PDF. {' '}
                    <a 
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                    >
                      Download
                    </a>
                    {' '} instead.
                  </p>
                </div>
              </object>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Utility function for formatting file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default PDFViewer;
