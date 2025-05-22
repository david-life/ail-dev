// components/DocumentCard/AccessibleCard.tsx
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
// If using Next.js, uncomment the next line and use <Image /> below
// import Image from 'next/image';

// Simple ExpandableText component definition

interface ExpandableTextProps {
  text: string;
  maxLength: number;
  ariaLabelledBy?: string;
}

function ExpandableText({ text, maxLength, ariaLabelledBy }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > maxLength;
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + '...';
  return (
    <div aria-labelledby={ariaLabelledBy}>
      <span>{displayText}</span>
      {isLong && (
        <button
          type="button"
          className="ml-2 text-primary underline focus:outline-none"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

interface AccessibleCardProps {
  document: Record<string, any>;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export function AccessibleCard({ document, onSelect, isSelected }: AccessibleCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      role="article"
      tabIndex={0}
      aria-selected={isSelected}
      className={`
        outline-none rounded-lg p-4
        ${isFocused ? 'ring-2 ring-primary' : ''}
        ${isSelected ? 'bg-primary/5' : 'bg-white'}
      `}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(document.id);
        }
      }}
    >
      <div className="flex items-start space-x-4">
          <img
            src={document.url}
            alt={`Thumbnail for ${document.title}`}
            className="object-cover rounded w-full h-full"
          />
        </div>

        <div className="flex-1">
          <h3 
            className="text-lg font-medium mb-2"
            id={`document-title-${document.id}`}
          >
            {document.title}
          </h3>
          
          {/* Description with expandable/collapsible functionality */}
          <ExpandableText
            text={document.description}
            maxLength={150}
            ariaLabelledBy={`document-title-${document.id}`}
          />

          {/* Metadata with semantic markup */}
          <dl className="mt-2 text-sm text-gray-500">
            <div className="flex">
              <dt className="sr-only">Category</dt>
              <dd>{document.category}</dd>
            </div>
            <div className="flex">
              <dt className="sr-only">Date</dt>
              <dd>{format(new Date(document.Date || ''), 'PPP')}</dd>
            </div>
          </dl>

          {/* Actions with proper labels */}
          <div 
            className="mt-4 flex items-center space-x-4"
            role="toolbar"
            aria-label="Document actions"
          >
            <button
              onClick={() => onSelect(document.id)}
              aria-pressed={isSelected}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
            
            <button
              onClick={() => window.open(document.url, '_blank')}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label={`Open ${document.title} in new tab`}
            >
              Open PDF
            </button>
          </div>
        </div>
    </motion.div>
  );
}