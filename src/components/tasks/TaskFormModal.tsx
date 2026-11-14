import { useId, useState, type ReactNode } from 'react';
import { useFormik, type FormikErrors } from 'formik';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Task } from '../../types/task';
import { fromLocalInputs, nextHourSlot, parseDateKey, todayKey, toLocalInputs } from '../../utils/date';
import { TITLE_MAX, validateTaskForm, type TaskFormValues } from '../../utils/validation';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import clockIcon from '../../assets/images/clock.png';
import calendarIcon from '../../assets/images/calander.png';

interface TaskFormModalProps {
  onClose: () => void;
  /** Task to edit; omit for "create" mode. */
  task?: Task | null;
  /** Pre-selected date (YYYY-MM-DD) when creating. */
  defaultDate?: string;
}

function initialValues(task?: Task | null, defaultDate?: string): TaskFormValues {
  if (task) {
    const { date, time } = toLocalInputs(task.scheduledAt);
    const endTime = task.endAt ? toLocalInputs(task.endAt).time : '';
    return { title: task.title, description: task.description ?? '', date, time, endTime, priority: task.priority };
  }
  const slot = nextHourSlot();
  // Never pre-fill a date in the past.
  const date = defaultDate && defaultDate > slot.date ? defaultDate : slot.date;
  return { title: '', description: '', date, time: slot.time, endTime: '', priority: 'Medium' };
}

/** "Friday 14, January", as in the Figma. */
function formatSheetDate(key: string): string {
  const d = parseDateKey(key);
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  const month = d.toLocaleDateString(undefined, { month: 'long' });
  return `${weekday} ${d.getDate()}, ${month}`;
}

/** "10:30 AM" from "10:30". */
function formatInputTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Open the browser's native picker (clicking a date/time input's text doesn't, in Chrome). */
function openPicker(input: HTMLInputElement) {
  try {
    input.showPicker?.();
  } catch {
    /* not supported, or blocked (e.g. inside a cross-origin iframe): the input still works by keyboard */
  }
}

const boxBase = 'flex h-10 w-full items-center border bg-white text-14 text-text-placeholder transition-colors';
const boxState = (error?: string) =>
  error
    ? 'border-red-400 focus-within:border-red-500'
    : 'border-border-input focus-within:border-blue';

/**
 * "Add New Task" bottom sheet from the Figma, reused for editing. Mounted only while open;
 * slides up from the bottom when the "+" button is pressed, and back down on close.
 */
export function TaskFormModal({ onClose, task, defaultDate }: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const { createTask, updateTask } = useTasks();
  const toast = useToast();
  const formId = useId();
  /** Set after a successful save so the sheet slides down before unmounting. */
  const [done, setDone] = useState(false);

  const formik = useFormik<TaskFormValues>({
    initialValues: initialValues(task, defaultDate),
    validate: (values) => validateTaskForm(values, { originalScheduledAt: task?.scheduledAt }),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        scheduledAt: fromLocalInputs(values.date, values.time)!,
        endAt: values.endTime ? fromLocalInputs(values.date, values.endTime) : null,
        priority: values.priority,
      };
      try {
        if (task) await updateTask(task.id, payload);
        else await createTask(payload);
        toast.success(isEdit ? 'Task updated' : 'Task created');
        setDone(true);
      } catch (err) {
        // Show the server's field errors under the matching inputs.
        const server = getFieldErrors(err);
        const fieldErrors: FormikErrors<TaskFormValues> = {};
        if (server.title) fieldErrors.title = server.title;
        if (server.description) fieldErrors.description = server.description;
        if (server.scheduledAt) fieldErrors.date = server.scheduledAt;
        if (server.endAt) fieldErrors.endTime = server.endAt;
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
    endTime: `${formId}-end`,
    date: `${formId}-date`,
    description: `${formId}-description`,
  };

  /** Native time input laid over a styled box, so it shows "Start"/"Ends" until a time is picked. */
  const timeBox = (field: 'time' | 'endTime', placeholder: string, label: string) => {
    const error = errorFor(field);
    return (
      <div>
        <div className={`relative ${boxBase} ${boxState(error)} gap-3 px-3`}>
          <img src={clockIcon} alt="" aria-hidden className="size-4 shrink-0" />
          <span className={values[field] ? '' : 'text-text-placeholder'}>
            {values[field] ? formatInputTime(values[field]) : placeholder}
          </span>
          <input
            id={ids[field]}
            name={field}
            type="time"
            aria-label={label}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${ids[field]}-error` : undefined}
            value={values[field]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onClick={(e) => openPicker(e.currentTarget)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>
        <FieldError id={`${ids[field]}-error`} error={error} />
      </div>
    );
  };

  return (
    <Modal
      open
      variant="sheet"
      closing={done}
      onClose={onClose}
      dismissible={!isSubmitting}
      title={isEdit ? 'Edit Task' : 'Add New Task'}
      footer={
        <Button
          type="submit"
          form={formId}
          size="lg"
          fullWidth
          loading={isSubmitting}
          className="!rounded-none text-16 font-normal"
        >
          {isEdit ? 'Save changes' : 'Create task'}
        </Button>
      }
    >
      <form id={formId} noValidate onSubmit={formik.handleSubmit} className="space-y-6">
        {submitError && (
          <div role="alert" className="bg-danger-50 px-3.5 py-2.5 text-13 text-red-700">
            {submitError}
          </div>
        )}

        <Field label="Task title" htmlFor={ids.title}>
          <input
            id={ids.title}
            name="title"
            data-autofocus
            value={values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Doing Homework"
            maxLength={TITLE_MAX + 20}
            aria-invalid={Boolean(errorFor('title'))}
            aria-describedby={errorFor('title') ? `${ids.title}-error` : undefined}
            className={`${boxBase} ${boxState(errorFor('title'))} px-2.5 placeholder:text-text-label focus:outline-none`}
          />
          <FieldError id={`${ids.title}-error`} error={errorFor('title')} />
        </Field>

        <fieldset>
          <legend className="mb-2.5 text-12 text-text-label">Set Time</legend>
          <div className="grid grid-cols-2 gap-7.5">
            {timeBox('time', 'Start', 'Start time')}
            {timeBox('endTime', 'Ends', 'End time (optional)')}
          </div>
        </fieldset>

        <Field label="Set Date" htmlFor={ids.date}>
          <div className={`relative ${boxBase} ${boxState(errorFor('date'))} justify-between px-2.5`}>
            <span>{values.date ? formatSheetDate(values.date) : 'Pick a date'}</span>
            <img src={calendarIcon} alt="" aria-hidden className="size-4 shrink-0" />
            <input
              id={ids.date}
              name="date"
              type="date"
              min={minDate}
              value={values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onClick={(e) => openPicker(e.currentTarget)}
              aria-invalid={Boolean(errorFor('date'))}
              aria-describedby={errorFor('date') ? `${ids.date}-error` : undefined}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </div>
          <FieldError id={`${ids.date}-error`} error={errorFor('date')} />
        </Field>

        <Field label="Description" htmlFor={ids.description}>
          <textarea
            id={ids.description}
            name="description"
            value={values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Add Description"
            rows={4}
            aria-invalid={Boolean(errorFor('description'))}
            aria-describedby={errorFor('description') ? `${ids.description}-error` : undefined}
            className={`block h-25 w-full resize-none border bg-white px-2.5 py-2.5 text-14 text-text-placeholder placeholder:text-text-placeholder transition-colors focus:outline-none ${boxState(errorFor('description'))}`}
          />
          <FieldError id={`${ids.description}-error`} error={errorFor('description')} />
        </Field>
      </form>
    </Modal>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2.5 block text-12 text-text-label">
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 text-12 font-medium text-red-600">
      {error}
    </p>
  );
}

export default TaskFormModal;
