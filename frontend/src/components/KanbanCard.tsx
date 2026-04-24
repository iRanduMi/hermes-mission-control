import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useKanban } from './KanbanProvider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, ChevronDown, ArrowUpDown } from 'lucide-react';
import { KANBAN_COLUMNS } from '@/types';
import { useUpdateTask } from '@/hooks/useTasks';

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  labels: string[];
  activity_log?: Array<{ timestamp: string; from_status: string; to_status: string }>;
  due_date?: string;
  column_order: number;
}

interface Props {
  task: TaskData;
  onStatusChanged?: (status: string) => void;
}

const KNOWN_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
type KnownPriority = typeof KNOWN_PRIORITIES[number];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-low/15 text-low border-low/20',
  medium: 'bg-medium/15 text-medium border-medium/20',
  high: 'bg-high/15 text-high border-high/20',
  critical: 'bg-critical/15 text-critical border-critical/20',
};

export function KanbanCard({ task, onStatusChanged }: Props) {
  const { setSelectedTask, setIsModalOpen } = useKanban();
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { mutate: updateTask, isPending } = useUpdateTask();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    disabled: isMobile,
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask({
      ...task,
      id: '',
      title: `${task.title} (copy)`,
      labels: [...task.labels],
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = useCallback((newStatus: string) => {
    updateTask({ id: task.id, data: { status: newStatus, column_order: 0 } });
    onStatusChanged?.(newStatus);
    setIsDropdownOpen(false);
  }, [task.id, updateTask, onStatusChanged]);

 return (
    <div style={{ touchAction: isMobile ? 'auto' : 'none' }}>
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'group relative p-2.5 sm:p-3 rounded-lg border border-panel-border bg-panel hover:bg-panel-hover cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-70 shadow-xl'
      )}
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.01 }}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full description + activity history popover */}
      {isHovered && task.description && (
        <div className="absolute z-50 left-full top-0 ml-2 w-72 max-h-80 overflow-y-auto rounded-lg border border-panel-border bg-canvas-subtle p-4 shadow-xl text-sm text-text-primary">
          <div className="whitespace-pre-wrap break-words">{task.description}</div>
          {(task as Record<string, unknown>)?.activity_log && (task as Record<string, unknown>).activity_log.length > 0 && (
            <div className="mt-3 pt-3 border-t border-panel-border">
              <div className="text-xs font-medium text-text-secondary mb-1.5">Activity History</div>
              <div className="space-y-1">
                {(task as Record<string, unknown>).activity_log.map((entry: { timestamp: string; from_status: string; to_status: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-mono opacity-60 shrink-0">{new Date(entry.timestamp).toLocaleString()}</span>
                    <span className="truncate">{entry.from_status} → {entry.to_status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Priority indicator & labels */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
        {task.priority && KNOWN_PRIORITIES.includes(task.priority as KnownPriority) && (
          <span className={cn(
            'px-1.5 py-0.5 text-[9px] sm:text-[10px] font-[510] uppercase tracking-wider rounded border',
            PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low
          )}>
            {task.priority}
          </span>
        )}
        {task.labels.map((label) => (
          <span key={label} className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-[510] rounded bg-panel-hover text-text-secondary border border-panel-border">
            {label}
          </span>
        ))}
      </div>
      
      {/* Title */}
      <span className="text-sm sm:text-[15px] text-text-primary font-[510] leading-snug block mb-2">
        {task.title}
      </span>
      
      {/* Description preview (first 80 chars) */}
      {task.description && task.description.length > 0 && (
        <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed line-clamp-2 mb-2">
          {task.description.slice(0, 80)}
          {task.description.length > 80 ? '...' : ''}
        </p>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between text-text-muted">
        {task.due_date && (
          <span className="flex items-center gap-1 text-[11px] sm:text-xs">
            <Calendar className="w-3 h-3" />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {isMobile ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              disabled={isPending}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-panel-hover border border-panel-border rounded-md hover:bg-panel-hover/80 transition-colors disabled:opacity-50"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Status</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute bottom-full right-0 mb-2 w-44 rounded-lg border border-panel-border bg-canvas-subtle shadow-xl z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {KANBAN_COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleStatusChange(col.id)}
                    disabled={task.status === col.id || isPending}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-left text-xs transition-colors",
                      task.status === col.id
                        ? "bg-accent-subtle text-text-primary font-medium"
                        : "hover:bg-panel-hover text-text-secondary",
                      task.status === col.id ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.accent }} />
                    <span className="truncate">{col.title}</span>
                    {task.status === col.id && (
                      <span className="ml-auto text-[10px] text-accent">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <DropdownMenu open={isHovered}>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 sm:p-1 rounded hover:bg-panel-hover transition-opacity">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
    </div>
  );
}
