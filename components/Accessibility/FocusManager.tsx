// components/Accessibility/FocusManager.tsx
import { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
}

export function FocusManager({ children, active = true, returnFocus = true }: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Move focus to the first focusable element
      const firstFocusable = containerRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      firstFocusable?.focus();
    }

    return () => {
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, returnFocus]);

  return (
    <div ref={containerRef} className="outline-none" tabIndex={-1}>
      {children}
    </div>
  );
}


