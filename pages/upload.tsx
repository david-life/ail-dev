import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Upload() {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setIsUploading(true);
    setUploadStatus('Starting upload...');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
    
      const data = await response.json();
    
      if (data.success) {
        setUploadStatus(`
          ✅ Upload complete!
          Document ID: ${data.documentId}
          URL: ${data.url}
          
          You can now close this window or upload another document.
        `);
        
        
      } else {
        setUploadStatus('❌ Upload failed: ' + data.error);
      }
    } catch (error) {
      setUploadStatus('❌ Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Upload Document</h1>
        
        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF Document
            </label>
            <input 
              type="file" 
              onChange={handleFileUpload}
              accept=".pdf"
              disabled={isUploading}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`p-4 rounded-md whitespace-pre-line ${
              uploadStatus.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : uploadStatus.includes('❌') 
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {uploadStatus}
            </div>
          )}

          {/* Processing Indicator */}
          {isUploading && (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-violet-500 rounded-full border-t-transparent"></div>
              <span>Processing document...</span>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-500 mt-4">
            <h2 className="font-medium mb-2">Upload Process:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>PDF will be uploaded to secure storage</li>
              <li>Text will be extracted and processed</li>
              <li>Document will be indexed for semantic search</li>
              <li>You'll be redirected to view the document after successful upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
