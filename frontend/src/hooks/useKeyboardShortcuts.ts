import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.metaKey || e.ctrlKey ? 'mod+' : ''}${e.shiftKey ? 'shift+' : ''}${e.altKey ? 'alt+' : ''}${e.key}`.toLowerCase();
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
