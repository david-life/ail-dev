// components/Skeletons/GridSkeleton.tsx

import { DocumentCardSkeleton } from "./DocumentCardSkeleton"; // ✅ Named export syntax

export const GridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {[...Array(6)].map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
};