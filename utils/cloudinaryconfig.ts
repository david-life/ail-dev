const pdfUploadConfig = {
  allowed_formats: ['pdf'],
  max_file_size: 10 * 1024 * 1024, // 10MB in bytes
  resource_type: 'raw',
  folder: 'pdfs', // All PDFs will go to this folder
  use_filename: true, // Keep original filename
  unique_filename: true // Add unique identifier
};
