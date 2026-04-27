import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useKanban } from './KanbanProvider';
import { KANBAN_COLUMNS } from '@/types';
import type { TaskStatus } from '@/types';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Record<string, unknown> | null;
}

export function TaskModal({ isOpen, onClose, task }: Props) {
  const { setIsModalOpen } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('requested');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [labelsStr, setLabelsStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'active' | 'blocked'>('idle');

  const SUB_STATUS_OPTIONS = [
    { value: 'idle', label: 'Idle', dot: 'bg-slate-400' },
    { value: 'active', label: 'Active', dot: 'bg-blue-500' },
    { value: 'blocked', label: 'Blocked', dot: 'bg-red-500' },
  ];

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  // Populate fields when editing
  useEffect(() => {
    if (task) {
      setTitle(String(task.title || ''));
      setDescription(String(task.description || ''));
      setStatus(String(task.status) as TaskStatus);
      setPriority(String(task.priority) as 'low' | 'medium' | 'high' | 'critical');
      setLabelsStr(Array.isArray(task.labels) ? (task.labels as string[]).join(', ') : '');
      setDueDate(task.due_date ? String(task.due_date) : '');
      setSubStatus((task.sub_status as 'idle' | 'active' | 'blocked' | undefined) || 'idle');
    } else {
      setTitle('');
      setDescription('');
      setStatus('requested');
      setPriority('medium');
      setLabelsStr('');
      setDueDate('');
      setSubStatus('idle');
    }
  }, [task, isOpen]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const labels = labelsStr.split(',').map(l => l.trim()).filter(Boolean);
    const validPriority = ['low', 'medium', 'high', 'critical'].includes(priority) ? priority : 'medium';
    if (task?.id) {
      updateMutation.mutate(
        { id: String(task.id), data: { title: title.trim(), description, status, priority: validPriority, labels, due_date: dueDate || null, sub_status: subStatus } },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(
        { title: title.trim(), description, status, priority: validPriority, labels, due_date: dueDate || null, sub_status: subStatus },
        { onSuccess: () => onClose() }
      );
    }
  };

  const handleDelete = () => {
    if (task?.id) {
      deleteMutation.mutate(String(task.id));
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={open => !open && setIsModalOpen(false)}>
          <DialogContent className="max-w-lg bg-canvas-subtle border-panel-border text-text-primary"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-text-primary">{task?.id ? 'Edit Task' : 'New Task'}</DialogTitle>
                  {task?.id && (() => {
                    const dotColor = subStatus === 'active' ? '#3fb950' : subStatus === 'blocked' ? '#f85149' : '#8b949e';
                    const bgColor = subStatus === 'active' ? '#3fb95018' : subStatus === 'blocked' ? '#f8514918' : '#8b949e18';
                    const borderColor = subStatus === 'active' ? '#3fb95040' : subStatus === 'blocked' ? '#f8514940' : '#8b949e40';
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border" style={{ backgroundColor: bgColor, color: dotColor, borderColor: borderColor }}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", subStatus === 'active' && "sub-status-pulse")} style={{ backgroundColor: dotColor }} />
                        {subStatus.charAt(0).toUpperCase() + subStatus.slice(1)}
                      </span>
                    );
                  })()}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-[510] text-text-secondary mb-1">Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent"
                    placeholder="Task title..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-[510] text-text-secondary mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent resize-none h-24"
                    placeholder="Describe the task..."
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-[510] text-text-secondary mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as TaskStatus)}
                      className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent"
                    >
                      {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-[510] text-text-secondary mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                      className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Sub-Status */}
                <div>
                  <label className="block text-xs font-[510] text-text-secondary mb-1">Sub-Status</label>
                  <select
                    value={subStatus}
                    onChange={e => setSubStatus(e.target.value as 'idle' | 'active' | 'blocked')}
                    className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent"
                  >
                    {SUB_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Labels */}
                <div>
                  <label className="block text-xs font-[510] text-text-secondary mb-1">Labels (comma-separated)</label>
                  <input
                    value={labelsStr}
                    onChange={e => setLabelsStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent"
                    placeholder="feature, backend, api..."
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-[510] text-text-secondary mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-panel-border bg-panel text-text-primary text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Activity History */}
                {task && 'activity_log' in task && Array.isArray(task.activity_log) && task.activity_log.length > 0 && (
                  <div>
                    <label className="block text-xs font-[510] text-text-secondary mb-1">Activity History</label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {task.activity_log.map((entry: { timestamp: string; from_status: string; to_status: string; actor: string }, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary bg-panel/50 rounded px-2 py-1">
                          <span className="font-mono opacity-60 shrink-0">{new Date(entry.timestamp).toLocaleString()}</span>
                          <span className="truncate shrink-0">
                            {entry.from_status} → {entry.to_status}
                          </span>
                          <span className="shrink-0 text-[10px] text-text-muted opacity-70">by {entry.actor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {Boolean(task?.id) && (
                  <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                    Delete
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>
                  {Boolean(task?.id) ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
