// pages/results.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import PDFViewer from '@/components/DocumentViewer/PDFViewer';

export default function ResultsPage() {
  const router = useRouter();
  const { url, pages, dimensions } = router.query;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Document Processed</h1>
        <Link href="/upload" className="text-blue-500 hover:underline">
          ← Back to Upload
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Processing Results</div>
              <div className="space-y-2">
                {pages && (
                  <div>
                    <span className="text-gray-600">Pages Processed:</span>{' '}
                    <span className="font-medium">{pages}</span>
                  </div>
                )}
                {dimensions && (
                  <div>
                    <span className="text-gray-600">Vector Dimensions:</span>{' '}
                    <span className="font-medium">{dimensions}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {url && (
            <div className="mt-6">
              <div className="h-[800px] max-h-[80vh]">
                <PDFViewer url={url} />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Process Another Document
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
