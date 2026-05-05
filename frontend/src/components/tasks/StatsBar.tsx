import React from 'react';
import { Task } from '@/types/task.types';
import { clsx } from 'clsx';

interface StatsBarProps {
  tasks: Task[];
  total: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ tasks, total }) => {
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const critical = tasks.filter(t => t.priority === 'critical').length;

  const stats = [
    { label: 'Total', value: total, color: 'text-slate-900', bg: 'bg-slate-100' },
    { label: 'To Do', value: todo, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'In Progress', value: inProgress, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Done', value: done, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Critical', value: critical, color: 'text-rose-700', bg: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" role="region" aria-label="Task statistics">
      {stats.map(s => (
        <div key={s.label} className={clsx('rounded-2xl px-4 py-3', s.bg)}>
          <p className="text-xs font-medium text-slate-500">{s.label}</p>
          <p className={clsx('text-2xl font-bold mt-0.5', s.color)}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};
