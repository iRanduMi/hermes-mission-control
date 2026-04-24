import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg bg-canvas-subtle border border-panel-border text-text-secondary text-sm shadow-xl"
    >
      {message}
    </motion.div>
  );
}
