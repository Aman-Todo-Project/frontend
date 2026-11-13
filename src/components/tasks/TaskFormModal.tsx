import { useId } from 'react';
import { useFormik, type FormikErrors } from 'formik';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField, Input, Textarea } from '../common/Form';
import { PRIORITIES, type Priority, type Task } from '../../types/task';
import { fromLocalInputs, nextHourSlot, todayKey, toLocalInputs } from '../../utils/date';
import { DESCRIPTION_MAX, TITLE_MAX, validateTaskForm, type TaskFormValues } from '../../utils/validation';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';

interface TaskFormModalProps {
  onClose: () => void;
  /** Task to edit; omit for "create" mode. */
  task?: Task | null;
  /** Pre-selected date (YYYY-MM-DD) when creating. */
  defaultDate?: string;
}

const priorityActive: Record<Priority, string> = {
  Low: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  Medium: 'border-orange-500 bg-orange-50 text-orange-700',
  High: 'border-red-500 bg-red-50 text-red-700',
};
const priorityDot: Record<Priority, string> = { Low: 'bg-emerald-500', Medium: 'bg-orange-500', High: 'bg-red-500' };

function initialValues(task?: Task | null, defaultDate?: string): TaskFormValues {
  if (task) {
    const { date, time } = toLocalInputs(task.scheduledAt);
    return { title: task.title, description: task.description ?? '', date, time, priority: task.priority };
  }
  const slot = nextHourSlot();
  // Never pre-fill a date in the past.
  const date = defaultDate && defaultDate > slot.date ? defaultDate : slot.date;
  return { title: '', description: '', date, time: slot.time, priority: 'Medium' };
}

/** "Add New Task" bottom sheet from the Figma, reused for editing. Mounted only while open. */
export function TaskFormModal({ onClose, task, defaultDate }: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const { createTask, updateTask } = useTasks();
  const toast = useToast();
  const formId = useId();

  const formik = useFormik<TaskFormValues>({
    initialValues: initialValues(task, defaultDate),
    // Same rules as before (utils/validation.ts), now run by Formik on change, blur and submit.
    validate: (values) => validateTaskForm(values, { originalScheduledAt: task?.scheduledAt }),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        scheduledAt: fromLocalInputs(values.date, values.time)!,
        priority: values.priority,
      };
      try {
        if (task) await updateTask(task.id, payload);
        else await createTask(payload);
        toast.success(isEdit ? 'Task updated' : 'Task created');
        onClose();
      } catch (err) {
        // Show the server's field errors under the matching inputs.
        const server = getFieldErrors(err);
        const fieldErrors: FormikErrors<TaskFormValues> = {};
        if (server.title) fieldErrors.title = server.title;
        if (server.description) fieldErrors.description = server.description;
        if (server.scheduledAt) fieldErrors.date = server.scheduledAt;
        if (server.priority) fieldErrors.priority = server.priority;
        helpers.setErrors(fieldErrors);
        helpers.setStatus(getErrorMessage(err));
      }
    },
  });

  const { values, isSubmitting } = formik;
  const submitError = formik.status as string | undefined;

  /** Show a field's error once it was touched or the form was submitted. */
  const errorFor = (field: keyof TaskFormValues) =>
    formik.touched[field] || formik.submitCount > 0 ? formik.errors[field] : undefined;

  // Past days are disabled in the picker. An existing task may keep its original (past) date.
  const today = todayKey();
  const originalDate = task ? toLocalInputs(task.scheduledAt).date : null;
  const minDate = originalDate && originalDate < today ? originalDate : today;

  const ids = {
    title: `${formId}-title`,
    time: `${formId}-time`,
    date: `${formId}-date`,
    description: `${formId}-description`,
  };

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!isSubmitting}
      title={isEdit ? 'Edit Task' : 'Add New Task'}
      footer={
        <>
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="lg" className="flex-[2]" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={formik.handleSubmit} className="space-y-4">
        {submitError && (
          <div role="alert" className="rounded-md bg-danger-50 px-3.5 py-2.5 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <FormField label="Task title" htmlFor={ids.title} required error={errorFor('title')}>
          <Input
            id={ids.title}
            name="title"
            data-autofocus
            value={values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Doing Homework"
            maxLength={TITLE_MAX + 20}
            error={errorFor('title')}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Set Time" htmlFor={ids.time} required error={errorFor('time')}>
            <Input
              id={ids.time}
              name="time"
              type="time"
              value={values.time}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={errorFor('time')}
            />
          </FormField>
          <FormField label="Set Date" htmlFor={ids.date} required error={errorFor('date')}>
            <Input
              id={ids.date}
              name="date"
              type="date"
              min={minDate}
              value={values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={errorFor('date')}
            />
          </FormField>
        </div>

        <FormField
          label="Description"
          htmlFor={ids.description}
          hint={`${values.description.length}/${DESCRIPTION_MAX}`}
          error={errorFor('description')}
        >
          <Textarea
            id={ids.description}
            name="description"
            value={values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Add Description"
            rows={3}
            error={errorFor('description')}
          />
        </FormField>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-ink-500">Priority</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((p) => {
              const active = values.priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => formik.setFieldValue('priority', p)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${
                    active ? priorityActive[p] : 'border-ink-200 bg-white text-ink-500 hover:bg-ink-100'
                  }`}
                >
                  <span className={`size-2 rounded-full ${priorityDot[p]}`} aria-hidden />
                  {p}
                </button>
              );
            })}
          </div>
          {errorFor('priority') && <p className="mt-1.5 text-xs font-medium text-red-600">{errorFor('priority')}</p>}
        </fieldset>
      </form>
    </Modal>
  );
}

export default TaskFormModal;
