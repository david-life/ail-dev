
import React, { useState } from 'react';

// components/DocumentCard/ExpandableText.tsx
interface ExpandableTextProps {
  text: string;
  maxLength: number;
  ariaLabelledBy?: string;
}

function ExpandableText({ text, maxLength, ariaLabelledBy }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;

  return (
    <div>
      <p
        aria-labelledby={ariaLabelledBy}
        className={shouldTruncate && !isExpanded ? 'line-clamp-2' : undefined}
      >
        {text}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary text-sm mt-1 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}