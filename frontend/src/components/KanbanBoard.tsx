import { DndContext, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors, type UniqueIdentifier } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
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
import { Filter, X, ChevronDown } from 'lucide-react';

export default function KanbanBoard() {
  const { data: tasksRaw, isLoading } = useTasks();
  const reorderMutation = useReorderTasks();
  const updateTaskMutation = useUpdateTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Record<string, unknown> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { searchQuery } = useSearch();

  // Filter state
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterSubStatus, setFilterSubStatus] = useState('all');
  const [openFilter, setOpenFilter] = useState<'owner' | 'sub-status' | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdowns on outside click
  useEffect(() => {
    if (!openFilter) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openFilter]);

  // Collect unique owners from tasks for dropdown (case-insensitive dedup)
  const uniqueOwners = useMemo(() => {
    const map = new Map<string, string>();
    tasksRaw?.forEach(t => {
      const owner = (t.owner as string)?.trim();
      if (owner && owner !== '—') {
        const key = owner.toLowerCase();
        if (!map.has(key)) map.set(key, owner);
      }
    });
    return Array.from(map.values()).sort();
  }, [tasksRaw]);

  // Collect unique sub_status values from tasks (case-insensitive dedup),
  // plus common values for discoverability
  const uniqueSubStatuses = useMemo(() => {
    const map = new Map<string, string>();
    // Seed with common sub_status values for discoverability
    for (const val of ['idle', 'active', 'blocked']) {
      map.set(val.toLowerCase(), val);
    }
    tasksRaw?.forEach(t => {
      const sub = (t.sub_status as string)?.trim();
      if (sub) {
        const key = sub.toLowerCase();
        if (!map.has(key)) map.set(key, sub);
      }
    });
    return Array.from(map.values()).sort();
  }, [tasksRaw]);

  const clearFilters = () => {
    setFilterOwner('all');
    setFilterSubStatus('all');
    setOpenFilter(null);
  };

  const hasActiveFilters = filterOwner !== 'all' || filterSubStatus !== 'all';

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

  // Filtered tasks: search + owner filter + sub_status filter (AND logic)
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.title as string).toLowerCase().includes(q) ||
        (t.description as string).toLowerCase().includes(q) ||
        (t.labels as string[])?.some((l: string) => l.toLowerCase().includes(q))
      );
    }

    // Apply owner filter
    if (filterOwner !== 'all') {
      result = result.filter(t => (t.owner as string) === filterOwner);
    }

    // Apply sub_status filter
    if (filterSubStatus !== 'all') {
      result = result.filter(t => (t.sub_status as string) === filterSubStatus);
    }

    return result;
  }, [tasks, searchQuery, filterOwner, filterSubStatus]);

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
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-1.5 px-1 sm:px-0 py-1.5 border-b border-panel-border/50 mb-1 flex-wrap shrink-0">
              <Filter className="w-3.5 h-3.5 text-text-muted/50 shrink-0" />
              <span className="text-xs text-text-muted/60 shrink-0">Owner:</span>
              <div className="relative shrink-0" ref={filterRef}>
                <button
                  onClick={() => setOpenFilter(openFilter === 'owner' ? null : 'owner')}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md border transition-colors whitespace-nowrap ${
                    filterOwner === 'all'
                      ? 'border-panel-border text-text-muted/70 hover:border-panel-border/80'
                      : 'border-accent/30 bg-accent-subtle/50 text-accent'
                  }`}
                >
                  {filterOwner === 'all' ? 'All' : filterOwner}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {openFilter === 'owner' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 z-50 min-w-[120px] rounded-lg border border-panel-border bg-canvas-subtle shadow-lg overflow-hidden"
                  >
                    {['all', ...uniqueOwners].map(opt => (
                      <button
                        key={opt}
                        onPointerUp={(e) => { e.stopPropagation(); setFilterOwner(opt); setOpenFilter(null); }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          filterOwner === opt
                            ? 'bg-accent-subtle/50 text-accent font-medium'
                            : 'text-text-secondary hover:bg-panel-hover'
                        }`}
                      >
                        {opt === 'all' ? 'All' : opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="w-px h-4 bg-panel-border/50 shrink-0 mx-0.5" />

              <span className="text-xs text-text-muted/60 shrink-0">Status:</span>
              <div className="relative shrink-0" ref={filterRef}>
                <button
                  onClick={() => setOpenFilter(openFilter === 'sub-status' ? null : 'sub-status')}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md border transition-colors whitespace-nowrap ${
                    filterSubStatus === 'all'
                      ? 'border-panel-border text-text-muted/70 hover:border-panel-border/80'
                      : 'border-accent/30 bg-accent-subtle/50 text-accent'
                  }`}
                >
                  {filterSubStatus === 'all' ? 'All' : filterSubStatus}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {openFilter === 'sub-status' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 z-50 min-w-[120px] rounded-lg border border-panel-border bg-canvas-subtle shadow-lg overflow-hidden"
                  >
                    {['all', ...uniqueSubStatuses].map(opt => (
                      <button
                        key={opt}
                        onPointerUp={(e) => { e.stopPropagation(); setFilterSubStatus(opt); setOpenFilter(null); }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          filterSubStatus === opt
                            ? 'bg-accent-subtle/50 text-accent font-medium'
                            : 'text-text-secondary hover:bg-panel-hover'
                        }`}
                      >
                        {opt === 'all' ? 'All' : opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs text-text-muted/60 hover:text-text-secondary rounded-md hover:bg-panel-hover transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pb-2 lg:pb-0 w-full sm:w-auto min-h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)] overflow-x-auto sm:overflow-y-auto">
              {KANBAN_COLUMNS.map(col => (
                <SortableContext key={col.id} items={[col.id as UniqueIdentifier]} strategy={rectSortingStrategy}>
                  <KanbanColumn column={col} tasks={filteredTasks.filter(t => t.status === col.status)} onAddTask={handleAddTask} onStatusChanged={handleStatusChanged} />
                </SortableContext>
              ))}
            </div>
          </DndContext>
          </>
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
