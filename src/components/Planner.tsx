import { useId, useState, type FormEvent } from 'react';
import { STATIONS, findStation } from '../data/stations';
import {
  THRUST_PROFILES,
  formatAu,
  formatDuration,
  formatKm,
  formatSpeed,
  planJump,
  type JumpPlan,
  type ThrustId,
} from '../lib/transit';

export interface PlottedRoute {
  fromId: string;
  toId: string;
  thrust: ThrustId;
  plan: JumpPlan;
}

interface PlannerProps {
  fromId: string;
  toId: string;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
  route: PlottedRoute | null;
  onPlot: (route: PlottedRoute) => void;
}

export function Planner({ fromId, toId, onFromChange, onToChange, route, onPlot }: PlannerProps) {
  const [thrust, setThrust] = useState<ThrustId>('standard');
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const from = findStation(fromId);
    const to = findStation(toId);
    if (!from || !to) return;
    if (from.id === to.id) {
      setError('Choose a destination different from your origin.');
      document.getElementById('planner-to')?.focus();
      return;
    }
    setError(null);
    const profile = THRUST_PROFILES.find((p) => p.id === thrust)!;
    onPlot({ fromId, toId, thrust, plan: planJump(from, to, profile.g) });
  }

  function swap() {
    onFromChange(toId);
    onToChange(fromId);
    setError(null);
  }

  const plottedFrom = route ? findStation(route.fromId) : undefined;
  const plottedTo = route ? findStation(route.toId) : undefined;
  const plottedProfile = route ? THRUST_PROFILES.find((p) => p.id === route.thrust) : undefined;

  return (
    <section className="planner" aria-labelledby="planner-title">
      <h2 id="planner-title" className="planner__title">
        Plot a jump
      </h2>
      <form className="planner__form" onSubmit={handleSubmit} noValidate>
        <div className="planner__stations">
          <div className="field">
            <label htmlFor="planner-from">From</label>
            <select id="planner-from" value={fromId} onChange={(e) => onFromChange(e.target.value)}>
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="icon-button planner__swap"
            onClick={swap}
            aria-label="Swap origin and destination"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path
                d="M7 4v14m0 0-3-3m3 3 3-3M17 20V6m0 0-3 3m3-3 3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="field">
            <label htmlFor="planner-to">To</label>
            <select
              id="planner-to"
              value={toId}
              onChange={(e) => {
                onToChange(e.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <p id={errorId} className="field-error">
            {error}
          </p>
        )}
        <fieldset className="segmented">
          <legend>Thrust</legend>
          <div className="segmented__options">
            {THRUST_PROFILES.map((p) => (
              <label key={p.id} className="segmented__option">
                <input
                  type="radio"
                  name="thrust"
                  value={p.id}
                  checked={thrust === p.id}
                  onChange={() => setThrust(p.id)}
                />
                <span>
                  {p.label} <span className="segmented__value">{p.g} g</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="button button--primary planner__submit">
          Plot route
        </button>
      </form>

      <div className="planner__result" role="status">
        {route && plottedFrom && plottedTo && plottedProfile ? (
          <>
            <p className="planner__route">
              {plottedFrom.name} to {plottedTo.name} at {plottedProfile.g} g
            </p>
            <dl className="stats">
              <div>
                <dt>Transit</dt>
                <dd>{formatDuration(route.plan.seconds)}</dd>
              </div>
              <div>
                <dt>Distance</dt>
                <dd>{formatAu(route.plan.distanceAu)}</dd>
              </div>
              <div>
                <dt>Speed at flip</dt>
                <dd>{formatSpeed(route.plan.peakKmS)}</dd>
              </div>
            </dl>
            <p className="planner__note">
              Burn to the midpoint of {formatKm(route.plan.distanceKm)}, flip, then brake for the same time.
            </p>
          </>
        ) : (
          <p className="planner__note">Pick two stations and a thrust, then plot the route.</p>
        )}
      </div>
    </section>
  );
}
