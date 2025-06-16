// pages/upload.tsx
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Upload.module.css';

interface UploadState {
  file: File | null;
  loading: boolean;
  error: string | null;
  processingStep: string | null;
  processingDetails: ProcessingDetails | null;
  isDragging: boolean;
}

interface ProcessingDetails {
  fileProcessed: string;
  pagesExtracted: number;
  textLength: number;
  vectorDimensions: number;
  cloudStorageUrl: string;
}

const PROCESSING_STEPS = {
  UPLOADING: 'Uploading file...',
  PARSING: 'Parsing PDF...',
  EXTRACTING: 'Extracting text...',
  VECTORIZING: 'Generating embeddings...',
  SAVING: 'Saving to database...'
} as const;

export default function Upload() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({
    file: null,
    loading: false,
    error: null,
    processingStep: null,
    processingDetails: null,
    isDragging: false
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setState(prev => ({
        ...prev,
        error: 'Please upload a PDF file',
        file: null
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      file,
      error: null
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
    
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setState(prev => ({
        ...prev,
        file,
        error: null
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: 'Please upload a PDF file'
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.file) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      processingStep: PROCESSING_STEPS.UPLOADING 
    }));

    try {
      const formData = new FormData();
      formData.append('pdf', state.file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setState(prev => ({
        ...prev,
        processingDetails: data.processingSteps
      }));

      // Show success message briefly before redirecting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to results with processing details
      router.push(`/results?` + new URLSearchParams({
        url: data.processingSteps.cloudStorageUrl,
        pages: data.processingSteps.pagesExtracted.toString(),
        dimensions: data.processingSteps.vectorDimensions.toString(),
        filename: data.processingSteps.fileProcessed
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    } finally {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        processingStep: null 
      }));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Document Upload</h1>
        <p>Upload your PDF for AI-powered processing</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div 
          className={`${styles.dropZone} ${state.isDragging ? styles.dragActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!state.file ? (
            <>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className={styles.uploadText}>
                Drag and drop your PDF here or click to browse
              </p>
              <p className={styles.uploadSubtext}>
                Maximum file size: 10MB
              </p>
            </>
          ) : (
            <div className={styles.fileInfo}>
              <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={styles.fileName}>{state.file.name}</span>
              {!state.loading && (
                <button 
                  type="button" 
                  className={styles.removeFile}
                  onClick={() => setState(prev => ({ ...prev, file: null }))}
                >
                  ×
                </button>
              )}
            </div>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={state.loading}
          />
        </div>

        {state.error && (
          <div className={styles.error}>
            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!state.file || state.loading}
          className={styles.uploadButton}
        >
          {state.loading ? (
            <>
              <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                // pages/upload.tsx (continued)
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload and Process</span>
            </>
          )}
        </button>
      </form>

      {state.processingStep && (
        <div className={styles.processingStatus}>
          <div className={styles.stepsProgress}>
            <div 
              className={styles.progressFill} 
              style={{ 
                width: `${
                  (Object.values(PROCESSING_STEPS)
                    .findIndex(step => step === state.processingStep) + 1) * 20
                  }%` 
              }}
            />
          </div>
          <p className={styles.currentStep}>{state.processingStep}</p>
        </div>
      )}

      {state.processingDetails && (
        <div className={styles.successMessage}>
          <svg className={styles.successIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className={styles.successText}>
            <h3>Processing Complete!</h3>
            <p>
              Successfully processed {state.processingDetails.pagesExtracted} pages
              and generated a {state.processingDetails.vectorDimensions}-dimensional vector.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
