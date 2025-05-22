export const validatePDF = (file: File) => {
  const errors = [];

  // Check file type
  if (!file.type.includes('pdf')) {
    errors.push('Only PDF files are allowed');
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must be less than 10MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
