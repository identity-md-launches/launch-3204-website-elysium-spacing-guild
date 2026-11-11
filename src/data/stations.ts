/**
 * Guild stations and their positions at the charter epoch.
 * Positions are a fixed, simplified snapshot in the plane of the ecliptic:
 * an orbit radius in astronomical units and an angle in degrees.
 */
export interface Station {
  id: string;
  name: string;
  body: string;
  /** Distance from the Sun in AU. */
  orbitAu: number;
  /** Angle around the Sun in degrees at the charter epoch. */
  angleDeg: number;
  /** Offset from the parent planet in AU (moons only). */
  offsetAu?: number;
  summary: string;
}

export const STATIONS: Station[] = [
  {
    id: 'lagos',
    name: 'Lagos Ring',
    body: 'Earth orbit',
    orbitAu: 1,
    angleDeg: 0,
    summary: 'Training decks, the guild archive and the busiest dock in the system.',
  },
  {
    id: 'tycho',
    name: 'Tycho Yard',
    body: 'Moon',
    orbitAu: 1,
    angleDeg: 0,
    offsetAu: 0.00257,
    summary: 'Where hulls are laid down and first burns are flown under instruction.',
  },
  {
    id: 'elysium',
    name: 'Elysium Port',
    body: 'Mars',
    orbitAu: 1.52,
    angleDeg: 38,
    summary: 'Our home port on the Elysium plain, and the seat of the charter council.',
  },
  {
    id: 'ceres',
    name: 'Ceres Hold',
    body: 'Asteroid belt',
    orbitAu: 2.77,
    angleDeg: 112,
    summary: 'Water, fuel and repairs for every crew working the belt.',
  },
  {
    id: 'callisto',
    name: 'Callisto Deep',
    body: 'Jupiter system',
    orbitAu: 5.2,
    angleDeg: 204,
    summary: 'A shielded station beyond the radiation belts, built into old ice.',
  },
  {
    id: 'titan',
    name: 'Titan Lantern',
    body: 'Saturn system',
    orbitAu: 9.54,
    angleDeg: 296,
    summary: 'The farthest light we keep burning, and the last stop before the dark.',
  },
];

export function findStation(id: string): Station | undefined {
  return STATIONS.find((s) => s.id === id);
}
