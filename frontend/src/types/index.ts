export type TaskStatus = 'requested' | 'plan_review' | 'in_progress' | 'review' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  activity_log: Array<{ timestamp: string; from_status: string; to_status: string }>;
  due_date?: string;
  column_order: number;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  status: TaskStatus;
  taskCount: number;
  accent?: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'requested', title: 'Requested', status: 'requested', taskCount: 0, accent: '#7170ff' },
  { id: 'plan_review', title: 'Plan Review', status: 'plan_review', taskCount: 0, accent: '#d29922' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', taskCount: 0, accent: '#58a6ff' },
  { id: 'review', title: 'Review', status: 'review', taskCount: 0, accent: '#f97583' },
  { id: 'done', title: 'Done', status: 'done', taskCount: 0, accent: '#3fb950' },
  { id: 'archived', title: 'Archived', status: 'archived', taskCount: 0, accent: 'rgba(255,255,255,0.25)' },
];
