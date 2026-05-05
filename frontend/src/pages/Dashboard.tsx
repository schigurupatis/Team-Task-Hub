import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchTasks, createTask, updateTask, deleteTask, setFilters, setPage, setSelectedTask, clearError } from '@/store/slices/taskSlice';
import { Task, TaskFilters } from '@/types/task.types';
import { TaskFormData } from '@/validators/task.validator';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/Toast';
import { Header } from '@/components/layout/Header';
import { StatsBar } from '@/components/tasks/StatsBar';
import { TaskFiltersBar } from '@/components/tasks/TaskFiltersBar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Modal } from '@/components/common/Modal';
import { TaskForm } from '@/components/tasks/TaskForm';
import { DeleteConfirm } from '@/components/tasks/DeleteConfirm';
import { Button } from '@/components/common/Button';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, total, page, limit, filters, loading, error } = useAppSelector(s => s.tasks);
  const { toast } = useToast();
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);
  const debouncedSearch = useDebounce(localFilters.search, 350);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // Fetch when filters/page change
  useEffect(() => {
    dispatch(setFilters({ ...localFilters, search: debouncedSearch }));
  }, [debouncedSearch, localFilters.priority, localFilters.status]);

  useEffect(() => {
    dispatch(fetchTasks({ ...filters, page, limit }));
  }, [filters, page, limit]);

  useEffect(() => {
    if (error) {
      toast(error, 'error');
      dispatch(clearError());
    }
  }, [error]);

  const handleFiltersChange = useCallback((f: TaskFilters) => {
    setLocalFilters(f);
    dispatch(setFilters(f));
    dispatch(setPage(1));
  }, []);

  const handleCreate = async (data: TaskFormData) => {
    await dispatch(createTask(data)).unwrap();
    toast('Task created successfully!', 'success');
    setShowCreate(false);
  };

  const handleEdit = async (data: TaskFormData) => {
    if (!editTask) return;
    await dispatch(updateTask({ id: editTask.id, dto: data })).unwrap();
    toast('Task updated!', 'success');
    setEditTask(null);
  };

  const handleStatusChange = async (task: Task, status: Task['status']) => {
    await dispatch(updateTask({ id: task.id, dto: { status } })).unwrap();
    toast('Status updated', 'info');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteTask(deleteTarget.id)).unwrap();
    toast('Task deleted', 'info');
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(total / limit);

  const emptyState = !loading && tasks.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onNewTask={() => setShowCreate(true)} />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <StatsBar tasks={tasks} total={total} />

        {/* Filters */}
        <section aria-label="Filter and search tasks">
          <TaskFiltersBar
            filters={localFilters}
            onChange={handleFiltersChange}
            totalResults={total}
          />
        </section>

        {/* Error */}
        {error && (
          <div role="alert" className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {/* Task Grid */}
        <section aria-label="Task list" aria-live="polite" aria-busy={loading}>
          {loading && tasks.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-100 rounded-full w-16" />
                    <div className="h-5 bg-slate-100 rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : emptyState ? (
            <div className="text-center py-24 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-lg font-semibold text-slate-700 mb-1">No tasks found</p>
              <p className="text-sm">
                {filters.search || filters.priority || filters.status
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              {!filters.search && !filters.priority && !filters.status && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Create Task
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditTask}
                  onDelete={setDeleteTarget}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Task list pagination" className="flex justify-center items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(setPage(page - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              ← Prev
            </Button>
            <span className="text-sm text-slate-600 px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(setPage(page + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              Next →
            </Button>
          </nav>
        )}
      </main>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm
            initial={editTask}
            onSubmit={handleEdit}
            onCancel={() => setEditTask(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <DeleteConfirm
        task={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
