// utils/animations/transitions.ts
export const transitions = {
  ease: [0.25, 0.1, 0.25, 1],
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30
  },
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10
  }
};

export const createStaggerChildren = (stagger = 0.05) => ({
  animate: {
    transition: {
      staggerChildren: stagger
    }
  }
});

export const createFadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: transitions.ease
    }
  }
});
