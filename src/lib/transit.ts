import type { Station } from '../data/stations';

export const AU_M = 149_597_870_700;
export const G = 9.80665;

export const THRUST_PROFILES = [
  { id: 'comfort', label: 'Comfort', g: 0.3 },
  { id: 'standard', label: 'Standard', g: 0.6 },
  { id: 'express', label: 'Express', g: 1 },
] as const;

export type ThrustId = (typeof THRUST_PROFILES)[number]['id'];

export function position(s: Station): { x: number; y: number } {
  const a = (s.angleDeg * Math.PI) / 180;
  let x = s.orbitAu * Math.cos(a);
  let y = s.orbitAu * Math.sin(a);
  if (s.offsetAu) {
    // Moons sit just off their planet, perpendicular to the Sun line.
    x += -Math.sin(a) * s.offsetAu;
    y += Math.cos(a) * s.offsetAu;
  }
  return { x, y };
}

/** Straight-line distance between two stations in AU. */
export function distanceAu(a: Station, b: Station): number {
  const p = position(a);
  const q = position(b);
  return Math.hypot(p.x - q.x, p.y - q.y);
}

export interface JumpPlan {
  distanceAu: number;
  distanceKm: number;
  /** Total time for an accelerate, flip, decelerate burn, in seconds. */
  seconds: number;
  /** Speed at the flip point in km/s. */
  peakKmS: number;
}

/**
 * Brachistochrone transit: constant thrust to the midpoint, flip, constant
 * braking to arrival. t = 2 * sqrt(d / a), peak v = sqrt(d * a).
 */
export function planJump(a: Station, b: Station, g: number): JumpPlan {
  const dAu = distanceAu(a, b);
  const d = dAu * AU_M;
  const acc = g * G;
  return {
    distanceAu: dAu,
    distanceKm: d / 1000,
    seconds: 2 * Math.sqrt(d / acc),
    peakKmS: Math.sqrt(d * acc) / 1000,
  };
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${plural(days, 'day', 'days')} ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

const wholeFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const auFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatKm(km: number): string {
  if (km >= 1_000_000) return `${oneDecimal.format(km / 1_000_000)} million km`;
  return `${wholeFormat.format(km)} km`;
}

export function formatAu(au: number): string {
  return `${auFormat.format(au)} AU`;
}

export function formatSpeed(kmS: number): string {
  return `${wholeFormat.format(kmS)} km/s`;
}
