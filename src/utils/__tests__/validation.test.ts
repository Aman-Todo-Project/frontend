import { describe, expect, it } from 'vitest';
import { validateTaskForm, hasErrors, type TaskFormValues } from '../validation';
import { fromLocalInputs } from '../date';

// "Now" for every test: Thu 12 Nov 2026, 14:00 local time.
const now = new Date(2026, 10, 12, 14, 0);

const valid: TaskFormValues = {
  title: 'Team sync',
  description: '',
  date: '2026-11-13',
  time: '10:30',
  priority: 'Medium',
};

const check = (values: Partial<TaskFormValues>, originalScheduledAt?: string) =>
  validateTaskForm({ ...valid, ...values }, { now, originalScheduledAt });

describe('validateTaskForm', () => {
  it('accepts a valid form', () => {
    expect(hasErrors(check({}))).toBe(false);
  });

  it('requires a non-blank title', () => {
    expect(check({ title: '   ' }).title).toBeDefined();
  });

  it('limits title and description length', () => {
    expect(check({ title: 'a'.repeat(121) }).title).toBeDefined();
    expect(check({ description: 'a'.repeat(1001) }).description).toBeDefined();
  });

  it('requires date and time', () => {
    const errors = check({ date: '', time: '' });
    expect(errors.date).toBeDefined();
    expect(errors.time).toBeDefined();
  });

  it('rejects impossible dates', () => {
    expect(check({ date: '2026-02-30' }).date).toBeDefined();
  });
});

describe('no scheduling in the past', () => {
  it('rejects a past date', () => {
    expect(check({ date: '2026-11-11' }).date).toBe('Please choose today or a future date.');
  });

  it('rejects a past date even when the time is missing', () => {
    expect(check({ date: '2026-11-11', time: '' }).date).toBeDefined();
  });

  it('rejects an earlier time today, accepts a later one', () => {
    expect(check({ date: '2026-11-12', time: '13:59' }).time).toBe('Please choose a time later than now.');
    expect(hasErrors(check({ date: '2026-11-12', time: '14:30' }))).toBe(false);
  });

  it('lets an existing past task keep its date and time while editing other fields', () => {
    const original = fromLocalInputs('2026-11-10', '09:00')!;
    expect(hasErrors(check({ date: '2026-11-10', time: '09:00', title: 'Renamed' }, original))).toBe(false);
  });

  it('does not let an existing task move to a different past date', () => {
    const original = fromLocalInputs('2026-11-10', '09:00')!;
    expect(check({ date: '2026-11-09', time: '09:00' }, original).date).toBeDefined();
  });

  it('asks for a new date if only the time of a past task is changed', () => {
    const original = fromLocalInputs('2026-11-10', '09:00')!;
    expect(check({ date: '2026-11-10', time: '10:00' }, original).date).toBeDefined();
  });
});
