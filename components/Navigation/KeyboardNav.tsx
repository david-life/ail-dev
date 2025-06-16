// components/Navigation/KeyboardNav.tsx
import { useKeyboard } from "@/hooks/useKeyboard";

interface KeyboardNavProps {
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function KeyboardNav({
  onNext,
  onPrevious,
  onClose,
  children,
}: KeyboardNavProps) {
  useKeyboard({
    ArrowRight: () => onNext(),
    ArrowLeft: () => onPrevious(),
    Escape: () => onClose(),
  });

  return <>{children}</>;
}
