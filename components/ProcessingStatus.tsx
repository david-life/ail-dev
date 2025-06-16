// components/ProcessingStatus.tsx
import React from "react";
import styles from "@/styles/Upload.module.css";
// Update the import path if the file exists elsewhere, for example:
import { PROCESSING_STEPS } from "@/pages/api/upload";

// export const PROCESSING_STEPS = {
//   STEP_ONE: 'Step One',
//   STEP_TWO: 'Step Two',
//   STEP_THREE: 'Step Three',
// };

interface ProcessingStatusProps {
  currentStep: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  currentStep,
}) => {
  const progress =
    ((Object.values(PROCESSING_STEPS).findIndex(
      (step) => step === currentStep
    ) +
      1) /
      Object.values(PROCESSING_STEPS).length) *
    100;

  return (
    <div className={styles.processingStatus}>
      <div className={styles.stepsProgress}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className={styles.currentStep}>{currentStep}</p>
    </div>
  );
};
