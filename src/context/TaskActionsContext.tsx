import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errors';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { OverlayLoader } from '../components/common/Loader';

// Dialogs are code-split: they're only downloaded when first needed (or when the browser is idle).
const loadForm = () => import('../components/tasks/TaskFormModal');
const loadDetails = () => import('../components/tasks/TaskDetailsModal');
const TaskFormModal = lazy(loadForm);
const TaskDetailsModal = lazy(loadDetails);

interface TaskActionsValue {
  openCreate: (defaultDate?: string) => void;
  openEdit: (task: Task) => void;
  openView: (task: Task) => void;
  confirmDelete: (task: Task) => void;
  toggleStatus: (task: Task) => void;
}

const TaskActionsContext = createContext<TaskActionsValue | null>(null);

type FormState = { open: false } | { open: true; task: Task | null; defaultDate?: string };

/**
 * Owns the task dialogs (create/edit, details, delete confirmation) so any
 * component can trigger them without prop drilling.
 */
export function TaskActionsProvider({ children }: { children: ReactNode }) {
  const { weeks, setTaskStatus, deleteTask } = useTasks();
  const toast = useToast();
  const [form, setForm] = useState<FormState>({ open: false });
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewFallback, setViewFallback] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  // Warm up the dialog chunks once the page has settled, so the first open is instant.
  useEffect(() => {
    const warm = () => {
      loadForm();
      loadDetails();
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 2000);
    return () => clearTimeout(id);
  }, []);

  const openCreate = useCallback((defaultDate?: string) => setForm({ open: true, task: null, defaultDate }), []);
  const openEdit = useCallback((task: Task) => {
    setViewId(null);
    setForm({ open: true, task });
  }, []);
  const openView = useCallback((task: Task) => {
    setViewFallback(task);
    setViewId(task.id);
  }, []);
  const confirmDelete = useCallback((task: Task) => setDeleting(task), []);

  const changeStatus = useCallback(
    async (task: Task, status: TaskStatus) => {
      try {
        await setTaskStatus(task.id, status);
        toast.success(status === 'Completed' ? 'Nice! Task completed' : 'Task moved back to In Progress');
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [setTaskStatus, toast]
  );

  const toggleStatus = useCallback(
    (task: Task) => changeStatus(task, task.status === 'Completed' ? 'In Progress' : 'Completed'),
    [changeStatus]
  );

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteTask(deleting.id);
      toast.success('Task deleted');
      if (viewId === deleting.id) setViewId(null);
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Keep the details dialog in sync with the latest server data.
  const viewedTask = useMemo(() => {
    if (!viewId) return null;
    for (const w of weeks) {
      const t = w.tasks.find((x) => x.id === viewId);
      if (t) return t;
    }
    return viewFallback?.id === viewId ? viewFallback : null;
  }, [viewId, weeks, viewFallback]);

  const value = useMemo(
    () => ({ openCreate, openEdit, openView, confirmDelete, toggleStatus }),
    [openCreate, openEdit, openView, confirmDelete, toggleStatus]
  );

  return (
    <TaskActionsContext.Provider value={value}>
      {children}
      <Suspense fallback={<OverlayLoader />}>
        {form.open && (
          <TaskFormModal task={form.task} defaultDate={form.defaultDate} onClose={() => setForm({ open: false })} />
        )}
        {viewedTask && (
          <TaskDetailsModal
            task={viewedTask}
            onClose={() => setViewId(null)}
            onEdit={openEdit}
            onDelete={confirmDelete}
            onStatusChange={changeStatus}
          />
        )}
      </Suspense>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete task?"
        message={deleting ? `"${deleting.title}" will be permanently removed. This can't be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </TaskActionsContext.Provider>
  );
}

export function useTaskActions() {
  const ctx = useContext(TaskActionsContext);
  if (!ctx) throw new Error('useTaskActions must be used inside <TaskActionsProvider>');
  return ctx;
}
