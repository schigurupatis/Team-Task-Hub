import React from 'react';
import { TaskFilters, Priority, Status } from '@/types/task.types';
import { clsx } from 'clsx';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  totalResults: number;
}

const selectClass = 'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition cursor-pointer';

export const TaskFiltersBar: React.FC<TaskFiltersBarProps> = ({ filters, onChange, totalResults }) => {
  const hasActiveFilters = filters.priority || filters.status || filters.search;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={filters.search ?? ''}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          aria-label="Search tasks by title"
        />
      </div>

      {/* Priority filter */}
      <select
        value={filters.priority ?? ''}
        onChange={e => onChange({ ...filters, priority: e.target.value as Priority | '' })}
        className={selectClass}
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Status filter */}
      <select
        value={filters.status ?? ''}
        onChange={e => onChange({ ...filters, status: e.target.value as Status | '' })}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
        <option value="archived">Archived</option>
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ search: '', priority: '', status: '' })}
          className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 whitespace-nowrap transition-colors"
          aria-label="Clear all filters"
        >
          Clear filters
        </button>
      )}

      {/* Count */}
      <span
        className={clsx(
          'ml-auto text-xs text-slate-500 whitespace-nowrap shrink-0',
          'sm:ml-0'
        )}
        aria-live="polite"
      >
        {totalResults} task{totalResults !== 1 ? 's' : ''}
      </span>
    </div>
  );
};
