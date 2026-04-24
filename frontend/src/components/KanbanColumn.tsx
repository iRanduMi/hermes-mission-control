import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanColumn as ColumnType } from '@/types';
import { KanbanCard } from './KanbanCard';
import { KanbanDropZone } from './KanbanDropZone';
import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from './EmptyState';
import { Plus } from 'lucide-react';

interface Props {
  column: ColumnType;
  tasks: Array<Record<string, unknown>>;
  onAddTask?: (status: string) => void;
  onStatusChanged?: (status: string) => void;
}

export function KanbanColumn({ column, tasks: tasksProp, onAddTask, onStatusChanged }: Props) {
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
      className="w-full sm:w-72 lg:w-80 flex flex-col max-h-full rounded-xl border border-panel-border bg-canvas-subtle/30 transition-colors"
    >
      {/* Column header */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-panel-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: column.accent || 'rgba(255,255,255,0.2)' }} />
          <span className="text-sm font-[590] text-text-primary">{column.title}</span>
          <span className="text-xs text-text-muted bg-panel px-1.5 py-0.5 rounded-full">{tasks.length}</span>
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

      {/* Drop zone */}
      <div className="flex-1 overflow-y-auto p-2 min-h-[60px]">
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
                  <KanbanCard task={task as unknown as import('@/components/KanbanCard').TaskData} onStatusChanged={onStatusChanged} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </KanbanDropZone>
      </div>
    </div>
  );
}
