import { useState } from 'react';
import heroLarge from './assets/hero-1920.webp';
import heroSmall from './assets/hero-960.webp';
import { STATIONS } from './data/stations';
import { DISCIPLINES } from './lib/charter';
import { Planner, type PlottedRoute } from './components/Planner';
import { RouteMap } from './components/RouteMap';
import { JoinForm } from './components/JoinForm';

function Logo() {
  return (
    <svg className="logo__mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
      <ellipse
        cx="16"
        cy="16"
        rx="13"
        ry="5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(-24 16 16)"
      />
      <circle cx="16" cy="16" r="5" className="logo__core" />
    </svg>
  );
}

export function App() {
  const [fromId, setFromId] = useState('lagos');
  const [toId, setToId] = useState('elysium');
  const [route, setRoute] = useState<PlottedRoute | null>(null);

  function planTo(id: string) {
    // Picking the current origin as the destination swaps the pair instead of plotting a zero-length jump.
    if (id === fromId) setFromId(toId);
    setToId(id);
    const target = document.getElementById('planner-title');
    target?.scrollIntoView({ block: 'start' });
    document.getElementById('planner-to')?.focus({ preventScroll: true });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Elysium Spacing Guild, back to top">
          <Logo />
          <span className="logo__text">Elysium Spacing Guild</span>
        </a>
        <nav className="site-nav" aria-label="Sections">
          <a href="#routes">Routes</a>
          <a href="#disciplines">Disciplines</a>
          <a href="#faq">Questions</a>
        </nav>
        <a className="button button--small" href="#charter">
          Join
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__media">
            <img
              src={heroLarge}
              srcSet={`${heroSmall} 960w, ${heroLarge} 1920w`}
              sizes="100vw"
              alt="Astronaut Bruce McCandless flying untethered above the blue curve of Earth"
              fetchPriority="high"
            />
          </div>
          <div className="hero__inner">
            <div className="hero__copy">
              <h1 id="hero-title">Untethered, we go further</h1>
              <p className="lede">
                The Elysium Spacing Guild trains spacers and plots safe burns between humanity&rsquo;s settled worlds.
              </p>
            </div>
            <Planner
              fromId={fromId}
              toId={toId}
              onFromChange={setFromId}
              onToChange={setToId}
              route={route}
              onPlot={setRoute}
            />
          </div>
        </section>

        <section className="section" id="routes" aria-labelledby="routes-title">
          <div className="section__head">
            <h2 id="routes-title">Six stations, Earth to Saturn</h2>
            <p>Every guild station keeps a dock, a beacon and a crew on watch. Pick one to plot a jump there.</p>
          </div>
          <div className="routes">
            <RouteMap route={route} />
            <ul className="station-list">
              {STATIONS.map((s) => (
                <li key={s.id} className="station">
                  <div className="station__text">
                    <h3>{s.name}</h3>
                    <p className="station__meta">
                      {s.body}, {s.orbitAu.toFixed(2)} AU from the Sun
                    </p>
                    <p>{s.summary}</p>
                  </div>
                  <button
                    type="button"
                    className="button button--secondary button--small"
                    onClick={() => planTo(s.id)}
                    aria-label={`Plot a jump to ${s.name}`}
                  >
                    Plot a jump
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" id="disciplines" aria-labelledby="disciplines-title">
          <div className="section__head">
            <h2 id="disciplines-title">Four ways to fly with us</h2>
            <p>Every member trains in one discipline and passes one trial before their first contract.</p>
          </div>
          <ul className="disciplines">
            {DISCIPLINES.map((d) => (
              <li key={d.id} className="discipline">
                <h3>{d.name}</h3>
                <p>{d.summary}</p>
                <p className="discipline__trial">{d.trial}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" id="charter" aria-labelledby="charter-title">
          <div className="section__head">
            <h2 id="charter-title">Sign the charter</h2>
            <p>Choose your home station and discipline to get your charter number and charter file.</p>
          </div>
          <JoinForm />
        </section>

        <section className="section" id="faq" aria-labelledby="faq-title">
          <div className="section__head">
            <h2 id="faq-title">Before you sign</h2>
          </div>
          <div className="faq">
            <details>
              <summary>How are transit times worked out?</summary>
              <p>
                Each jump is a straight burn: constant thrust to the midpoint, a flip, then braking at the same
                thrust. Transit time is 2 &times; &radic;(distance &divide; acceleration). Station positions are fixed
                at the charter epoch, so real orbits would change these numbers over time.
              </p>
            </details>
            <details>
              <summary>Where does my charter go?</summary>
              <p>
                Nowhere. This site has no server. Your charter number comes from the details you enter, and the
                charter file is drawn in your browser when you download it.
              </p>
            </details>
            <details>
              <summary>Why is the guild home port on Mars?</summary>
              <p>
                Elysium Port sits on the Elysium plain, the guild&rsquo;s namesake. The charter council meets there.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Photo: Bruce McCandless II on the first untethered spacewalk, 7 February 1984. NASA, public domain (image
          S84-27017).
        </p>
        <p>Elysium Spacing Guild</p>
      </footer>
    </>
  );
}
