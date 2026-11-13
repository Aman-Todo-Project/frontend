import { describe, expect, it } from 'vitest';
import {
  defaultDateForWeek,
  formatDayLabel,
  startOfWeekKey,
  weekDays,
  fromLocalInputs,
  getWeekRelation,
  isOverdue,
  nextHourSlot,
  toLocalInputs,
} from '../date';

describe('local date/time inputs', () => {
  it('round-trips date and time through an ISO string', () => {
    const iso = fromLocalInputs('2026-11-15', '23:45');
    expect(iso).not.toBeNull();
    expect(toLocalInputs(iso!)).toEqual({ date: '2026-11-15', time: '23:45' });
  });

  it('returns null for invalid input', () => {
    expect(fromLocalInputs('', '10:00')).toBeNull();
    expect(fromLocalInputs('2026-02-30', '10:00')).toBeNull();
    expect(fromLocalInputs('2026-11-12', '25:00')).toBeNull();
  });

  it('nextHourSlot rolls over to the next day after 23:00', () => {
    expect(nextHourSlot(new Date(2026, 10, 12, 23, 10))).toEqual({ date: '2026-11-13', time: '00:00' });
    expect(nextHourSlot(new Date(2026, 10, 12, 9, 59))).toEqual({ date: '2026-11-12', time: '10:00' });
  });
});

describe('week helpers', () => {
  it('classifies weeks relative to today (Monday and Sunday inclusive)', () => {
    expect(getWeekRelation('2026-11-09', '2026-11-15', '2026-11-09')).toBe('current');
    expect(getWeekRelation('2026-11-09', '2026-11-15', '2026-11-15')).toBe('current');
    expect(getWeekRelation('2026-11-09', '2026-11-15', '2026-11-16')).toBe('past');
    expect(getWeekRelation('2026-11-09', '2026-11-15', '2026-11-08')).toBe('upcoming');
  });

  it('defaults new tasks to today in the current week, otherwise to Monday', () => {
    expect(defaultDateForWeek('2026-11-09', '2026-11-15', '2026-11-12')).toBe('2026-11-12');
    expect(defaultDateForWeek('2026-11-16', '2026-11-22', '2026-11-12')).toBe('2026-11-16');
  });
});

describe('day strip navigation', () => {
  it('finds the Monday of any day, including Sunday', () => {
    expect(startOfWeekKey('2026-11-09')).toBe('2026-11-09'); // Monday
    expect(startOfWeekKey('2026-11-12')).toBe('2026-11-09'); // Thursday
    expect(startOfWeekKey('2026-11-15')).toBe('2026-11-09'); // Sunday
    expect(startOfWeekKey('2027-01-01')).toBe('2026-12-28'); // across New Year
  });

  it('lists Monday to Sunday', () => {
    expect(weekDays('2026-11-09')).toEqual([
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
    ]);
  });

  it('labels today, tomorrow and yesterday', () => {
    expect(formatDayLabel('2026-11-12', '2026-11-12')).toBe('Today');
    expect(formatDayLabel('2026-11-13', '2026-11-12')).toBe('Tomorrow');
    expect(formatDayLabel('2026-11-11', '2026-11-12')).toBe('Yesterday');
  });
});

describe('isOverdue', () => {
  const now = new Date('2026-11-12T12:00:00Z');
  it('flags past open tasks only', () => {
    expect(isOverdue('2026-11-12T11:00:00Z', 'In Progress', now)).toBe(true);
    expect(isOverdue('2026-11-12T11:00:00Z', 'Completed', now)).toBe(false);
    expect(isOverdue('2026-11-12T13:00:00Z', 'In Progress', now)).toBe(false);
  });
});
