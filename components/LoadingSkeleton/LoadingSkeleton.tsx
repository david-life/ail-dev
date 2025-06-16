import React from 'react';

export const LoadingSkeleton: React.FC = () => (
  <div className="p-6">
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-48 w-full mb-4" />
      ))}
    </div>
    <div className="text-center text-gray-400 mt-4">Loading...</div>
  </div>
);

export default LoadingSkeleton;