import { useEffect, useState } from 'react';
import station from './assets/station.webp';
import stationSmall from './assets/station-small.webp';
import stationPortrait from './assets/station-portrait.webp';

export function App() {
  const [closer, setCloser] = useState(false);

  useEffect(() => {
    function returnToOverview(event: KeyboardEvent) {
      if (event.key === 'Escape') setCloser(false);
    }

    window.addEventListener('keydown', returnToOverview);
    return () => window.removeEventListener('keydown', returnToOverview);
  }, []);

  return (
    <main className="scene" data-closer={closer} aria-labelledby="guild-name">
      <div className="scene__frame">
        <picture className="scene__art" id="station-view">
          <source media="(max-aspect-ratio: 3/4)" srcSet={stationPortrait} />
          <img
            src={station}
            srcSet={`${stationSmall} 960w, ${station} 1536w`}
            sizes="100vw"
            width="1536"
            height="1024"
            alt="A vast ring-shaped space station, its inner rim alive with green landscapes and golden lights, above the blue curve of Earth."
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      <h1 className="scene__name" id="guild-name">elysium guild</h1>

      <button
        className="view-control"
        type="button"
        aria-label="View station closer"
        aria-pressed={closer}
        aria-controls="station-view"
        aria-keyshortcuts={closer ? 'Escape' : undefined}
        onClick={() => setCloser((current) => !current)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M6 12h12" />
          <path className="view-control__vertical" d="M12 6v12" />
        </svg>
      </button>
    </main>
  );
}
