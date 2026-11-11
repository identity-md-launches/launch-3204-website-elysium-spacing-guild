import { STATIONS } from '../data/stations';
import { position } from '../lib/transit';
import type { PlottedRoute } from './Planner';

/** Orbits drawn on a square-root scale so inner and outer stations both fit. */
const SCALE = 60;

function toMap(id: string): { x: number; y: number } {
  const station = STATIONS.find((s) => s.id === id)!;
  const p = position(station);
  const r = Math.hypot(p.x, p.y);
  const scaled = Math.sqrt(r) * SCALE;
  const k = r === 0 ? 0 : scaled / r;
  // SVG y grows downward; flip so angles run counter-clockwise.
  return { x: p.x * k, y: -p.y * k };
}

const LABEL_OFFSET: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  lagos: { dx: 12, dy: 16, anchor: 'start' },
  tycho: { dx: 12, dy: -8, anchor: 'start' },
  elysium: { dx: 12, dy: -8, anchor: 'start' },
  ceres: { dx: 0, dy: -14, anchor: 'middle' },
  callisto: { dx: 12, dy: -10, anchor: 'start' },
  titan: { dx: -6, dy: 26, anchor: 'middle' },
};

export function RouteMap({ route }: { route: PlottedRoute | null }) {
  const orbits = Array.from(new Set(STATIONS.map((s) => s.orbitAu)));
  const from = route ? toMap(route.fromId) : null;
  const to = route ? toMap(route.toId) : null;
  const titleFrom = route ? STATIONS.find((s) => s.id === route.fromId)?.name : '';
  const titleTo = route ? STATIONS.find((s) => s.id === route.toId)?.name : '';

  return (
    <figure className="map">
      <svg viewBox="-230 -230 460 460" role="img" aria-labelledby="map-title">
        <title id="map-title">
          {route
            ? `Map of guild stations with the route from ${titleFrom} to ${titleTo} drawn`
            : 'Map of guild stations around the Sun'}
        </title>
        {orbits.map((r) => (
          <circle key={r} className="map__orbit" r={Math.sqrt(r) * SCALE} />
        ))}
        <circle className="map__sun" r="9" />
        {from && to && (
          <line className="map__route" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        )}
        {STATIONS.map((s) => {
          const p = toMap(s.id);
          const o = LABEL_OFFSET[s.id];
          const active = route && (route.fromId === s.id || route.toId === s.id);
          return (
            <g key={s.id} className={active ? 'map__station is-active' : 'map__station'}>
              <circle cx={p.x} cy={p.y} r={s.offsetAu ? 3.5 : 5.5} />
              <text x={p.x + o.dx} y={p.y + o.dy} textAnchor={o.anchor}>
                {s.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>Orbits drawn on a square-root scale. Positions are fixed at the charter epoch.</figcaption>
    </figure>
  );
}
