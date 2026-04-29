import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanColumn as ColumnType } from '@/types';
import { KanbanCard, type TaskData } from './KanbanCard';
import { KanbanDropZone } from './KanbanDropZone';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from './EmptyState';
import { Plus, Info } from 'lucide-react';

interface Props {
  column: ColumnType;
  tasks: Array<Record<string, unknown>>;
  onAddTask?: (status: string) => void;
  onStatusChanged?: (status: string) => void;
}

export function KanbanColumn({ column, tasks: tasksProp, onAddTask, onStatusChanged }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 360);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleToggle = useCallback(() => {
    setShowTooltip((prev) => !prev);
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTooltip]);

  const { setNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: { type: 'column', column },
    disabled: true,
  });

  const tasks = useMemo(() =>
    [...tasksProp].sort((a, b) => ((a.column_order as number) ?? 0) - ((b.column_order as number) ?? 0)),
    [tasksProp]
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="w-full sm:w-72 lg:w-80 flex flex-col h-full overflow-hidden rounded-xl border border-panel-border bg-canvas-subtle/30 transition-colors"
    >
      {/* Column header - shrinkable */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-panel-border shrink-0">
        <div className="relative">
          {/* Click-to-open trigger */}
          <div
            ref={triggerRef}
            role="button"
            tabIndex={0}
            aria-label={`View bucket info for ${column.title}`}
            aria-expanded={showTooltip}
            aria-describedby={`bucket-info-${column.id}`}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
              if (e.key === 'Escape' && showTooltip) {
                setShowTooltip(false);
                triggerRef.current?.focus();
              }
            }}
            className="flex items-center gap-1.5 cursor-pointer py-1 -ml-1 pr-2 rounded-md hover:bg-panel-hover/50 transition-colors min-h-[44px]"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: column.accent || 'rgba(255,255,255,0.2)' }} />
            <span className="text-sm font-[590] text-text-primary truncate">{column.title}</span>
            {/* Owner badge */}
            <span className="text-[10px] text-text-muted bg-panel-hover/60 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
              {column.owner === '—' ? 'N/A' : column.owner}
            </span>
            <span className="text-xs text-text-muted bg-panel px-1.5 py-0.5 rounded-full flex-shrink-0">{tasks.length}</span>
            {/* Info icon */}
            <Info className="w-3.5 h-3.5 text-text-muted/60 flex-shrink-0" />
          </div>
          {/* Popup */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                id={`bucket-info-${column.id}`}
                className={`absolute left-0 z-50 mt-2 rounded-lg border border-panel-border bg-canvas-subtle shadow-lg ${
                  isMobile ? 'fixed bottom-4 left-4 right-4 top-auto w-auto max-h-[70vh] overflow-y-auto' : 'w-72'
                }`}
                style={
                  isMobile
                    ? { maxWidth: 'calc(100vw - 2rem)' }
                    : { maxWidth: 'calc(100vw - 2rem)' }
                }
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header row */}
                <div className="flex items-center justify-between px-3 pt-3 pb-1">
                  <span className="text-sm font-semibold text-text-primary">{column.title}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTooltip(false)}
                    className="p-1 rounded-md hover:bg-panel-hover text-text-muted/60 hover:text-text-secondary transition-colors"
                    aria-label="Close"
                  >
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </motion.button>
                </div>
                {/* Divider */}
                <div className="mx-3 border-t border-panel-border" />
                {/* Body */}
                <div className="px-3 py-2">
                  <p className="text-xs text-text-secondary leading-relaxed">{column.description}</p>
                </div>
                {/* Footer */}
                <div className="px-3 pb-3">
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold">Next:</span>{' '}
                    <span className="text-text-secondary">{column.nextSteps}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Backdrop for mobile bottom-sheet */}
          {isMobile && showTooltip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setShowTooltip(false)}
            />
          )}
        </div>
        {onAddTask && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddTask(column.id)}
            className="p-1 rounded-md hover:bg-panel-hover text-text-muted/50 hover:text-text-secondary transition-colors"
            title={`Add task to ${column.title}`}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        )}
      </div>

     {/* Drop zone - scrolls when content overflows */}
      <div className="overflow-y-auto overflow-x-hidden p-2 lg:max-h-[calc(100vh-160px)]">
        <KanbanDropZone column={column}>
          {tasks.length === 0 ? (
            <EmptyState type="column" columnTitle={column.title} />
          ) : (
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={String(task.id)}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <KanbanCard task={task as unknown as TaskData} onStatusChanged={onStatusChanged} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </KanbanDropZone>
      </div>
    </div>
  );
}
