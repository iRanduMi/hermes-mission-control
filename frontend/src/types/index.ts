export type TaskStatus = 'requested' | 'requirements' | 'technical' | 'tech_review' | 'in_progress' | 'pr_review' | 'ready_for_review' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  activity_log: Array<{ timestamp: string; from_status: string; to_status: string; actor: string }>;
  owner: string;
  sub_status: string;
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
  description: string;
  nextSteps: string;
  owner: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'requested',
    title: 'Requested',
    status: 'requested',
    taskCount: 0,
    accent: '#7170ff',
    description: 'User request received. Hermes reviews and asks clarifying questions to build a complete requirements doc.',
    nextSteps: 'Hermes completes requirements → move to Requirements',
    owner: 'Jared → Hermes',
  },
  {
    id: 'requirements',
    title: 'Requirements',
    status: 'requirements',
    taskCount: 0,
    accent: '#d29922',
    description: 'Requirements document being written or awaiting Dex review.',
    nextSteps: 'Complete → move to Technical. Rejected → move back to Requested.',
    owner: 'Hermes',
  },
  {
    id: 'technical',
    title: 'Technical',
    status: 'technical',
    taskCount: 0,
    accent: '#e6a817',
    description: 'Technical plan being written — code changes needed, architecture adjustments, technical changes required.',
    nextSteps: 'Complete → move to Tech Review. Insufficient → move back to Requirements.',
    owner: 'Dex',
  },
  {
    id: 'tech_review',
    title: 'Tech Review',
    status: 'tech_review',
    taskCount: 0,
    accent: '#db6d28',
    description: 'Hermes reviews Dex\'s technical plan to verify it meets all criteria and business requirements.',
    nextSteps: 'Approved → move to In Progress. Rejected → move back to Technical.',
    owner: 'Hermes',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    status: 'in_progress',
    taskCount: 0,
    accent: '#58a6ff',
    description: 'Hermes is implementing code changes based on the approved technical plan.',
    nextSteps: 'Complete → move to PR Review.',
    owner: 'Hermes',
  },
  {
    id: 'pr_review',
    title: 'PR Review',
    status: 'pr_review',
    taskCount: 0,
    accent: '#f97583',
    description: 'Code changes (PR) ready for Dex review. Dex validates implementation against the technical plan.',
    nextSteps: 'Approved → move to Ready for Review. Rejected → move back to In Progress with feedback.',
    owner: 'Dex',
  },
  {
    id: 'ready_for_review',
    title: 'Ready for Review',
    status: 'ready_for_review',
    taskCount: 0,
    accent: '#a371f7',
    description: 'Deployed and ready for your testing. Hermes has pushed changes to a testable environment.',
    nextSteps: 'Approved → move to Done. Rejected → move back to In Progress with feedback.',
    owner: 'Jared',
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    taskCount: 0,
    accent: '#3fb950',
    description: 'Reviewed, tested, and accepted. Feature complete.',
    nextSteps: 'Archive when no longer needed.',
    owner: '—',
  },
  {
    id: 'archived',
    title: 'Archived',
    status: 'archived',
    taskCount: 0,
    accent: 'rgba(255,255,255,0.25)',
    description: 'Closed, no longer active. Kept for historical reference.',
    nextSteps: 'N/A — archived tasks are read-only.',
    owner: '—',
  },
];
