import { describe, expect, it } from 'vitest';
import { findStation } from '../src/data/stations';
import { distanceAu, formatDuration, planJump } from '../src/lib/transit';
import { charterNumber, charterSvg } from '../src/lib/charter';

describe('transit maths', () => {
  it('measures Earth orbit to Moon as a tiny hop', () => {
    const d = distanceAu(findStation('lagos')!, findStation('tycho')!);
    expect(d).toBeCloseTo(0.00257, 5);
  });

  it('uses t = 2 * sqrt(d / a) for a flip-and-burn transit', () => {
    const plan = planJump(findStation('lagos')!, findStation('elysium')!, 1);
    const expected = 2 * Math.sqrt((plan.distanceAu * 149_597_870_700) / 9.80665);
    expect(plan.seconds).toBeCloseTo(expected, 6);
    expect(plan.peakKmS).toBeGreaterThan(0);
  });

  it('formats durations in days, hours and minutes', () => {
    expect(formatDuration(45 * 60)).toBe('45 min');
    expect(formatDuration(3 * 3600 + 20 * 60)).toBe('3 h 20 min');
    expect(formatDuration(86400 + 2 * 3600)).toBe('1 day 2 h');
    expect(formatDuration(3 * 86400)).toBe('3 days 0 h');
  });
});

describe('charter', () => {
  const input = { name: 'Ada <Okafor>', stationName: 'Ceres Hold', discipline: 'medic' as const, date: '2026-11-11' };
  it('gives the same number for the same entries', () => {
    expect(charterNumber(input)).toBe(charterNumber({ ...input }));
    expect(charterNumber(input)).toMatch(/^ESG-\d{6}$/);
  });
  it('escapes names inside the SVG', () => {
    const svg = charterSvg(input);
    expect(svg).toContain('Ada &lt;Okafor&gt;');
    expect(svg).not.toContain('<Okafor>');
  });
});
