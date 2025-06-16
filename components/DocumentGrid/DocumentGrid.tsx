import { motion } from "framer-motion";
import { DocumentCard } from "./DocumentCard";
import { LoadingSkeleton } from "../LoadingSkeleton/LoadingSkeleton";

import type { Record } from "../../types/document";

interface DocumentGridProps {
  documents?: Record[]; // Made optional to avoid undefined errors
  isLoading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const DocumentGrid = ({
  documents = [],
  isLoading,
}: DocumentGridProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      {Array.isArray(documents) && documents.length > 0 ? (
        documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)
      ) : (
        <p className="text-center text-gray-500">No documents available.</p>
      )}
    </motion.div>
  );
};
