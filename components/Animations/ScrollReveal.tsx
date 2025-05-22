// components/Animations/ScrollReveal.tsx
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export const ScrollReveal = ({ 
  children, 
  direction = 'up',
  delay = 0 
}: ScrollRevealProps) => {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  const directionVariants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionVariants[direction]
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: 'x' in directionVariants[direction] ? (isVisible ? 0 : (directionVariants[direction] as { x: number }).x) : undefined,
        y: 'y' in directionVariants[direction] ? (isVisible ? 0 : (directionVariants[direction] as { y: number }).y) : undefined
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

