// components/DocumentGrid/AnimatedGrid.tsx
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Record } from '../../types/document';
// Import AnimatedButton (adjust the path as needed)
// TODO: Update the path below to the correct location of AnimatedButton
// import { AnimatedButton } from '../AnimatedButton/AnimatedButton';
// import { AnimatedButton } from '../AnimatedButton';
// import { AnimatedButton } from '../AnimatedButton/AnimatedButton';
// import { AnimatedButton } from '../AnimatedButton';
import { AnimatedButton } from '../Animations/AnimatedButton';
// If the path above is incorrect, adjust it to the actual location of AnimatedButton.

interface AnimatedGridProps {
  documents: Record[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  hover: { scale: 1.03, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  tap: { scale: 0.98 },
};

export const AnimatedGrid = ({ 
  documents, 
  selectedId, 
  onSelect 
}: AnimatedGridProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            layoutId={`card-${doc.id}`}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelect(String(doc.id))}
          >
            <div className={`
              relative rounded-lg overflow-hidden
              ${selectedId === doc.id ? 'ring-2 ring-primary' : ''}
            `}>
              {/* Thumbnail */}
              <motion.div
                className="relative aspect-video"
                layoutId={`thumbnail-${doc.id}`}
              >
                <Image
                  src={doc.url}
                  alt={doc.title}
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Content */}
              <motion.div
                className="p-4"
                layoutId={`content-${doc.id}`}
              >
                <motion.h3
                  className="text-lg font-medium mb-2"
                  layoutId={`title-${doc.id}`}
                >
                  {doc.title}
                </motion.h3>
                
                <motion.p
                  className="text-gray-600 line-clamp-2"
                  layoutId={`description-${doc.id}`}
                >
                  {doc.description}
                </motion.p>
              </motion.div>

              {/* Expand/Collapse Animation */}
              <AnimatePresence>
                {selectedId === doc.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t"
                  >
                    {/* Additional content when expanded */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    {/* Selected Item Overlay */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => onSelect('')}
          >
            <motion.div
              layoutId={`card-${selectedId}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         w-full max-w-2xl bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Expanded View Content */}
              {documents.map((doc) => {
                if (doc.id === selectedId) {
                  return (
                    <div key={doc.id} className="relative">
                      <motion.div
                        layoutId={`thumbnail-${doc.id}`}
                        className="relative aspect-video"
                      >
                        <Image
                          src={doc.url}
                          alt={doc.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      </motion.div>

                      <div className="p-6">
                        <motion.h2
                          layoutId={`title-${doc.id}`}
                          className="text-2xl font-display font-semibold mb-4"
                        >
                          {doc.title}
                        </motion.h2>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <p className="text-gray-600 mb-4">
                            {doc.description}
                          </p>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">Category:</span>
                              <span>{doc.category}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">Date:</span>
                              <span>{format(new Date(doc.Date || ''), 'PPP')}</span>
                            </div>

                            {doc.similarity && (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">Match:</span>
                                <span>{Math.round(doc.similarity * 100)}%</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex space-x-4">
                            <AnimatedButton
                              onClick={() => window.open(doc.url, '_blank')}
                              className="bg-primary text-white px-4 py-2 rounded-lg"
                            >
                              Open PDF
                            </AnimatedButton>
                            
                            <AnimatedButton
                              onClick={() => onSelect('')}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
                            >
                              Close
                            </AnimatedButton>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
