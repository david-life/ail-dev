// hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<Element | null>(null);
  
  const frozen = useRef(false);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (frozen.current) return;
    
    observer.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);

        if (freezeOnceVisible && isIntersecting) {
          frozen.current = true;
          observer.current?.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  useEffect(() => {
    const currentElement = element;
    const currentObserver = observer.current;

    if (currentElement && currentObserver) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement && currentObserver) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [element]);

  return { ref: setElement, isVisible };
}

