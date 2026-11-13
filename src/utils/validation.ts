import { PRIORITIES, type Priority } from '../types/task';
import { fromLocalInputs, toLocalInputs, todayKey } from './date';

export interface TaskFormValues {
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
}

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 1000;

interface ValidateOptions {
  now?: Date;
  /** When editing: the task's current scheduledAt. An unchanged past date is still accepted. */
  originalScheduledAt?: string;
}

export function validateTaskForm(values: TaskFormValues, { now = new Date(), originalScheduledAt }: ValidateOptions = {}): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Please enter a task title.';
  else if (title.length > TITLE_MAX) errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;

  if (values.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!values.date) errors.date = 'Please pick a date.';
  if (!values.time) errors.time = 'Please pick a time.';
  const scheduledAt = values.date && values.time ? fromLocalInputs(values.date, values.time) : null;
  if (values.date && values.time && !scheduledAt) {
    errors.date = 'Please enter a valid date and time.';
  }

  // No scheduling in the past (unless an existing task keeps its original date/time).
  const original = originalScheduledAt ? toLocalInputs(originalScheduledAt) : null;
  const today = todayKey(now);
  if (!errors.date && values.date && values.date < today && values.date !== original?.date) {
    errors.date = 'Please choose today or a future date.';
  } else if (scheduledAt && !errors.date && new Date(scheduledAt) < now) {
    const unchanged = original?.date === values.date && original?.time === values.time;
    if (!unchanged) {
      if (values.date < today) errors.date = 'This date has passed. Please choose today or a future date.';
      else errors.time = 'Please choose a time later than now.';
    }
  }

  if (!PRIORITIES.includes(values.priority)) errors.priority = 'Please choose a priority.';

  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
