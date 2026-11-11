import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { STATIONS, findStation } from '../data/stations';
import {
  DISCIPLINES,
  charterFilename,
  charterNumber,
  charterSvg,
  disciplineName,
  downloadFile,
  type CharterInput,
  type DisciplineId,
} from '../lib/charter';

interface Errors {
  name?: string;
  discipline?: string;
}

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function JoinForm() {
  const [name, setName] = useState('');
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [discipline, setDiscipline] = useState<DisciplineId | ''>('');
  const [errors, setErrors] = useState<Errors>({});
  const [charter, setCharter] = useState<CharterInput | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const charterRef = useRef<HTMLHeadingElement>(null);
  const ids = { name: useId(), discipline: useId() };

  // Move focus to the new charter so keyboard and screen-reader users land on the result.
  useEffect(() => {
    if (charter) charterRef.current?.focus();
  }, [charter]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name, at least 2 characters.';
    if (!discipline) next.discipline = 'Choose the discipline you want to train in.';
    setErrors(next);
    if (next.name) {
      nameRef.current?.focus();
      return;
    }
    if (next.discipline) {
      document.querySelector<HTMLInputElement>('input[name="discipline"]')?.focus();
      return;
    }
    setCharter({
      name: name.trim(),
      stationName: findStation(stationId)?.name ?? '',
      discipline: discipline as DisciplineId,
      date: today(),
    });
  }

  return (
    <div className="join">
      <form className="join__form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="join-name">Your name</label>
          <input
            id="join-name"
            ref={nameRef}
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Ada Okafor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? ids.name : undefined}
          />
          {errors.name && (
            <p id={ids.name} className="field-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="join-station">Home station</label>
          <select id="join-station" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}, {s.body}
              </option>
            ))}
          </select>
        </div>
        <fieldset
          className="choice"
          aria-describedby={errors.discipline ? ids.discipline : undefined}
        >
          <legend>Discipline</legend>
          {DISCIPLINES.map((d) => (
            <label key={d.id} className="choice__option">
              <input
                type="radio"
                name="discipline"
                value={d.id}
                checked={discipline === d.id}
                onChange={() => setDiscipline(d.id)}
              />
              <span>{d.name}</span>
            </label>
          ))}
          {errors.discipline && (
            <p id={ids.discipline} className="field-error">
              {errors.discipline}
            </p>
          )}
        </fieldset>
        <button type="submit" className="button button--primary">
          Sign the charter
        </button>
        <p className="join__privacy">Nothing is sent anywhere. Your charter is drawn in this browser and saved as a file.</p>
      </form>

      <div className="join__result" aria-live="polite">
        {charter ? (
          <div className="charter">
            <h3 className="charter__title" ref={charterRef} tabIndex={-1}>
              Welcome aboard, {charter.name}
            </h3>
            <dl className="charter__facts">
              <div>
                <dt>Charter</dt>
                <dd>{charterNumber(charter)}</dd>
              </div>
              <div>
                <dt>Discipline</dt>
                <dd>{disciplineName(charter.discipline)}</dd>
              </div>
              <div>
                <dt>Home station</dt>
                <dd>{charter.stationName}</dd>
              </div>
              <div>
                <dt>Signed</dt>
                <dd>{charter.date}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => downloadFile(charterFilename(charter), charterSvg(charter), 'image/svg+xml')}
            >
              Download charter
            </button>
          </div>
        ) : (
          <div className="charter charter--empty">
            <p className="charter__empty-title">Your charter appears here</p>
            <p>Fill in the form to get a charter number and a printable charter file.</p>
          </div>
        )}
      </div>
    </div>
  );
}
