import { DndContext, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors, type UniqueIdentifier } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearch } from '@/App';
import { useTasks, useReorderTasks, useUpdateTask } from '@/hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { KanbanProvider } from './KanbanProvider';
import { TaskModal } from './TaskModal';
import { KANBAN_COLUMNS } from '@/types';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { EmptyState } from './EmptyState';
import { Toast } from './Toast';

export default function KanbanBoard() {
  const { data: tasksRaw, isLoading } = useTasks();
  const reorderMutation = useReorderTasks();
  const updateTaskMutation = useUpdateTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Record<string, unknown> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { searchQuery } = useSearch();

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px)').matches;
    }
    return false;
  });

  // Update on resize
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Conditionally create sensors: no sensors on mobile (disables drag-and-drop)
  const sensors = !isMobile
    ? useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, {
          activationConstraint: { delay: 50, tolerance: 5 },
          preventScroll: true,
        }),
      )
    : useSensors();

  const tasks = useMemo(() => (tasksRaw || []).sort((a, b) => ((a.column_order as number) ?? 0) - ((b.column_order as number) ?? 0)), [tasksRaw]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const taskId = activeId.replace('task-', '');

    if (overId.startsWith('column-drop-')) {
      // Moved to different column
      const targetColumnId = overId.replace('column-drop-', '');
      updateTaskMutation.mutate({
        id: taskId,
        data: { status: targetColumnId, column_order: 0 },
      });
    } else if (overId.startsWith('task-')) {
      // Reorder within same column
      const overTaskId = overId.replace('task-', '');
      const overTask = tasks.find(t => t.id === overTaskId);
      if (!overTask) return;

      const activeIdx = tasks.findIndex(t => t.id === taskId);
      const overIdx = tasks.findIndex(t => t.id === overTaskId);
      const newOrder = [...tasks];

      // Remove active task from its current position
      const [removed] = newOrder.splice(activeIdx, 1);

      // Insert at new position
      const adjustedIdx = overIdx > activeIdx ? overIdx - 1 : overIdx;
      newOrder.splice(adjustedIdx, 0, removed);

      // Calculate new column orders
      const reorderList = newOrder.map((task, idx) => ({
        id: String(task.id),
        status: task.status as string,
        column_order: idx,
      }));

      reorderMutation.mutate(reorderList);
    }
  }, [tasks, reorderMutation, updateTaskMutation]);

  // Keyboard shortcuts for new task and search
  useKeyboardShortcuts({
    'mod+n': () => { setSelectedTask(null); setIsModalOpen(true); },
    '/': () => { /* handled globally in App */ },
  });

  // Filtered tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t =>
      (t.title as string).toLowerCase().includes(q) ||
      (t.description as string).toLowerCase().includes(q) ||
      (t.labels as string[])?.some((l: string) => l.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  // Handle column + button: open modal pre-filled with status
  const handleAddTask = (status: string) => {
    setSelectedTask({ status });
    setIsModalOpen(true);
  };

  // Handle status change from mobile dropdown: show toast
  const handleStatusChanged = useCallback((newStatus: string) => {
    const col = KANBAN_COLUMNS.find(c => c.id === newStatus);
    setToastMessage(`Moved to ${col?.title || newStatus}`);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  return (
    <KanbanProvider
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      selectedTask={selectedTask}
      setSelectedTask={setSelectedTask}
    >
      <div className="flex-1 overflow-x-auto overflow-y-auto sm:overflow-y-hidden p-2 sm:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-text-muted text-sm">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState type="global" />
        ) : filteredTasks.length === 0 && searchQuery.trim() ? (
          <EmptyState type="search" />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col sm:flex-row h-full gap-2 sm:gap-3 lg:gap-4 pb-2 lg:pb-0 w-full sm:w-auto">
              {KANBAN_COLUMNS.map(col => (
                <SortableContext key={col.id} items={[col.id as UniqueIdentifier]} strategy={rectSortingStrategy}>
                  <KanbanColumn column={col} tasks={filteredTasks.filter(t => t.status === col.status)} onAddTask={handleAddTask} onStatusChanged={handleStatusChanged} />
                </SortableContext>
              ))}
            </div>
          </DndContext>
        )}
      </div>

      {/* Floating add button */}
      <motion.button
        onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white text-2xl flex items-center justify-center shadow-lg hover:bg-accent/90 transition-colors z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        +
      </motion.button>

      {/* Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
        />
      )}

      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} />}
      </AnimatePresence>
    </KanbanProvider>
  );
}
