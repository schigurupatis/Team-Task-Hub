import React, { useState } from 'react';
import { TaskFormSchema, TaskFormData } from '@/validators/task.validator';
import { Task } from '@/types/task.types';
import { Button } from '@/components/common/Button';
import { clsx } from 'clsx';

interface TaskFormProps {
  initial?: Partial<Task>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const STATUSES = ['todo', 'in-progress', 'done', 'archived'] as const;

const inputClass = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';
const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

export const TaskForm: React.FC<TaskFormProps> = ({ initial, onSubmit, onCancel, submitLabel = 'Save Task' }) => {
  const [form, setForm] = useState<TaskFormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    priority: initial?.priority ?? 'medium',
    status: initial?.status ?? 'todo',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof TaskFormData, value: string) => {
    setForm((prev: TaskFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: Partial<Record<keyof TaskFormData, string>>) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = TaskFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TaskFormData, string>> = {};
      result.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const key = err.path[0] as keyof TaskFormData;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(result.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Task form" className="space-y-4">
      <div>
        <label htmlFor="task-title" className={labelClass}>
          Title <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="What needs to be done?"
          className={clsx(inputClass, errors.title && 'border-rose-400 ring-1 ring-rose-400')}
          aria-required="true"
          aria-describedby={errors.title ? 'title-error' : undefined}
          maxLength={200}
          autoFocus
        />
        {errors.title && <p id="title-error" role="alert" className="mt-1 text-xs text-rose-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="task-desc" className={labelClass}>Description</label>
        <textarea
          id="task-desc"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Add more details..."
          rows={3}
          maxLength={2000}
          className={clsx(inputClass, 'resize-none')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-priority" className={labelClass}>Priority</label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            className={inputClass}
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-status" className={labelClass}>Status</label>
          <select
            id="task-status"
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className={inputClass}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};