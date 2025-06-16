// hooks/useAnimationControls.ts
import { useState, useEffect } from 'react';
import { AnimationControls, useAnimation } from 'framer-motion';

interface UseAnimationControlsProps {
  isVisible?: boolean;
  delay?: number;
}

export function useAnimationControls({ 
  isVisible = true, 
  delay = 0 
}: UseAnimationControlsProps = {}) {
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          delay,
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1]
        }
      });
      setHasAnimated(true);
    }
  }, [isVisible, controls, delay, hasAnimated]);

  return controls;
}

