import { Priority, Status } from '@/types/task.types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_LABELS: Record<Status, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
  'archived': 'Archived',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const STATUS_COLORS: Record<Status, string> = {
  'todo': 'bg-slate-100 text-slate-700 border-slate-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'done': 'bg-green-100 text-green-800 border-green-200',
  'archived': 'bg-gray-100 text-gray-500 border-gray-200',
};

export const PRIORITY_DOT: Record<Priority, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-rose-500',
};

export const formatDate = (iso: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};
