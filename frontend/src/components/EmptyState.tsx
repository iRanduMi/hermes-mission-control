import { motion } from 'framer-motion';
import { Plus, SearchX } from 'lucide-react';

interface Props {
  type: 'column' | 'global' | 'search';
  onAdd?: () => void;
  columnTitle?: string;
}

export function EmptyState({ type, onAdd, columnTitle }: Props) {
  if (type === 'search') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <SearchX className="w-12 h-12 text-text-muted/40 mb-4" />
        <p className="text-text-muted text-sm text-center">No tasks match your search.</p>
        <p className="text-text-muted/60 text-xs mt-1">Try different keywords or clear the filter.</p>
      </motion.div>
    );
  }

  if (type === 'global') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-panel-hover border border-panel-border flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-text-muted/40" />
        </div>
        <p className="text-text-secondary text-sm font-[510]">No tasks yet</p>
        <p className="text-text-muted text-xs mt-1 text-center max-w-xs">
          Click the <span className="text-text-secondary font-[510]">+</span> button or press <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-panel-hover border border-panel-border font-[510]">⌘N</kbd> to create your first task.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-8 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="w-10 h-10 rounded-xl bg-panel-hover border border-panel-border flex items-center justify-center mb-2">
        <Plus className="w-5 h-5 text-text-muted/40" />
      </div>
      <p className="text-text-muted text-xs text-center">No tasks</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-2 px-3 py-1 text-[11px] text-accent hover:text-accent/80 transition-colors font-[510]"
        >
          Add one to {columnTitle}
        </button>
      )}
    </motion.div>
  );
}
