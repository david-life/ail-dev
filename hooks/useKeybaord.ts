// hooks/useKeyboard.ts
import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

export function useKeyboard(keyMap: KeyMap, active = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const handler = keyMap[event.key];
    if (handler) {
      handler(event);
    }
  }, [keyMap]);

  useEffect(() => {
    if (active) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [active, handleKeyDown]);
}