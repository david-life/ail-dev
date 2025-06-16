// components/Animations/AnimatedIcon.tsx
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  icon: React.ReactNode;
  isActive?: boolean;
}

export const AnimatedIcon = ({ icon, isActive = false }: AnimatedIconProps) => {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.1 : 1,
        rotate: isActive ? 360 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {icon}
    </motion.div>
  );
};