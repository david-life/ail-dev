// components/Animations/AnimatedButton.tsx
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false 
}: AnimatedButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={false}
    >
      <motion.div
        className="absolute inset-0 bg-primary/10 rounded-lg"
        initial={false}
        animate={{ 
          scale: disabled ? 1 : 0,
          opacity: disabled ? 0.5 : 0 
        }}
      />
      {children}
    </motion.button>
  );
};