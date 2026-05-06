import React from 'react';
import { Task } from '@/types/task.types';
import { Badge } from '@/components/common/Badge';
import {
  PRIORITY_LABELS, STATUS_LABELS, PRIORITY_COLORS, STATUS_COLORS, PRIORITY_DOT, formatDate
} from '@/utils/task.utils';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
}

const STATUSES: Task['status'][] = ['todo', 'in-progress', 'done', 'archived'];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  return (
    <article
      className={clsx(
        'group relative bg-white rounded-2xl border border-slate-100 shadow-sm',
        'hover:shadow-md hover:border-slate-200 transition-all duration-200',
        'flex flex-col gap-3 p-5',
        task.status === 'done' && 'opacity-80',
        task.status === 'archived' && 'opacity-60'
      )}
      aria-label={`Task: ${task.title}`}
    >
      {/* Priority indicator strip */}
      <div
        className={clsx('absolute left-0 top-4 bottom-4 w-1 rounded-r-full', PRIORITY_DOT[task.priority])}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 pl-3">
        <h3 className={clsx(
          'font-semibold text-slate-900 text-sm leading-snug line-clamp-2 flex-1',
          task.status === 'done' && 'line-through text-slate-400'
        )}>
          {task.title}
        </h3>
        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label={`Edit ${task.title}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            aria-label={`Delete ${task.title}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pl-3">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 pl-3">
        <Badge
          label={PRIORITY_LABELS[task.priority]}
          colorClass={PRIORITY_COLORS[task.priority]}
          dot={PRIORITY_DOT[task.priority]}
        />
        <Badge
          label={STATUS_LABELS[task.status]}
          colorClass={STATUS_COLORS[task.status]}
        />
      </div>

      {/* Status quick-change */}
      <div className="pl-3">
        <label className="sr-only" htmlFor={`status-${task.id}`}>Change status</label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={e => onStatusChange(task, e.target.value as Task['status'])}
          className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-400 pl-3 pt-1 border-t border-slate-50">
        <time dateTime={task.updatedAt} title={formatDate(task.updatedAt)}>
          Updated {formatDate(task.updatedAt)}
        </time>
      </div>
    </article>
  );
};
