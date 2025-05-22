// components/SuccessMessage.tsx
import React from 'react';
import styles from '@/styles/Upload.module.css';
import { SuccessIcon } from './icons';
import { ProcessingDetails } from '../types/upload'; // Make sure this path is correct

interface SuccessMessageProps {
  details: ProcessingDetails;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ details }) => (
  <div className={styles.successMessage}>
    <SuccessIcon />
    <div className={styles.successText}>
      <h3>Processing Complete!</h3>
      <p>
        Successfully processed {details.pagesExtracted} pages
        and generated a {details.vectorDimensions}-dimensional vector.
      </p>
    </div>
  </div>
);
