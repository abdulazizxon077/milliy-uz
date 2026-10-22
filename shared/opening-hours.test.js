import { describe, expect, it } from 'vitest';
import {
  describeWeek,
  normalizeOpeningHours,
  parseOpeningHours,
  scheduleStatus,
} from './opening-hours.js';

// 2026-10-19 is a Monday.
const at = (day, time) => new Date(`2026-10-${String(19 + day).padStart(2, '0')}T${time}:00`);

describe('parseOpeningHours', () => {
  it('reads 24/7', () => {
    expect(parseOpeningHours('24/7')).toEqual({ always: true });
  });

  it('reads day ranges and several time ranges', () => {
    const { week } = parseOpeningHours('Mo-Fr 09:00-13:00,14:00-18:00; Sa 10:00-14:00');
    expect(week[0]).toEqual([
      [540, 780],
      [840, 1080],
    ]);
    expect(week[5]).toEqual([[600, 840]]);
    expect(week[6]).toEqual([]);
  });

  it('lets a later rule override earlier days', () => {
    const { week } = parseOpeningHours('Mo-Su 08:00-20:00; Su off');
    expect(week[6]).toEqual([]);
    expect(week[3]).toEqual([[480, 1200]]);
  });

  it('accepts Uzbek and Russian day names and a missing separator', () => {
    expect(parseOpeningHours('Du-Sh 09:00-18:00')).toEqual(parseOpeningHours('Mo-Sa 09:00-18:00'));
    expect(parseOpeningHours('Пн-Пт 09:00-18:00')).toEqual(parseOpeningHours('Mo-Fr 09:00-18:00'));
    expect(parseOpeningHours('Mo-Sa 09:00-18:00 Su 10:00-14:00').week[6]).toEqual([[600, 840]]);
  });

  it('wraps ranges past midnight', () => {
    expect(parseOpeningHours('18:00-02:00').week[2]).toEqual([[1080, 1560]]);
  });

  it('rejects values it cannot read', () => {
    expect(parseOpeningHours('')).toBeNull();
    expect(parseOpeningHours('PH off')).toBeNull();
    expect(parseOpeningHours('Mo-Sa')).toBeNull();
    expect(normalizeOpeningHours('kelishilgan holda')).toBe('');
    expect(normalizeOpeningHours('Mo - Fr 09:00 - 18:00')).toBe('Mo-Fr 09:00-18:00');
  });
});

describe('scheduleStatus', () => {
  const office = parseOpeningHours('Mo-Fr 09:00-18:00');

  it('reports open with time left', () => {
    expect(scheduleStatus(office, at(0, '17:30'))).toMatchObject({
      open: true,
      closesIn: 30,
      closesAt: '18:00',
    });
  });

  it('reports the next opening, including after a weekend', () => {
    expect(scheduleStatus(office, at(0, '07:00'))).toMatchObject({
      open: false,
      opensAt: '09:00',
      opensDay: 0,
    });
    expect(scheduleStatus(office, at(4, '19:00'))).toMatchObject({
      open: false,
      opensDay: 3,
      opensWeekday: 0,
    });
  });

  it('keeps a late-night range open after midnight', () => {
    const bar = parseOpeningHours('Fr 18:00-02:00');
    expect(scheduleStatus(bar, at(5, '01:00'))).toMatchObject({ open: true, closesAt: '02:00' });
  });

  it('handles places that never open', () => {
    expect(scheduleStatus(parseOpeningHours('Mo-Su off'), at(0, '12:00'))).toEqual({
      open: false,
      opensIn: null,
    });
  });
});

describe('describeWeek', () => {
  it('builds Uzbek rows', () => {
    const rows = describeWeek(parseOpeningHours('Mo-Sa 09:00-18:00'));
    expect(rows[0]).toEqual({ day: 0, name: 'Dushanba', text: '09:00–18:00' });
    expect(rows[6].text).toBe('Dam olish kuni');
    expect(describeWeek({ always: true })[3].text).toBe('24 soat');
  });
});
