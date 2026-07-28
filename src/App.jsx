import { useState, useRef, useEffect, useCallback } from "react";
import { TOPICS_1000 } from "./topic_list";

/* ---------------------------------------------------------------
   TOPIC LIBRARY — 140 curated topics across 14 categories
--------------------------------------------------------------- */
const TOPICS = [...TOPICS_1000];
const CATEGORIES = [...new Set(TOPICS.map((x) => x.c))];

/* ---------------------------------------------------------------
   THEME TOKENS
--------------------------------------------------------------- */
const THEMES = {
  dark: {
    bg: "#0F1320",
    bgGrad: "radial-gradient(circle at 20% -10%, #1B2440 0%, #0F1320 55%)",
    panel: "#1A2133",
    panelAlt: "#141A29",
    text: "#ECE8DC",
    textMuted: "#8890A6",
    border: "rgba(236,232,220,0.09)",
    accent: "#F2B84B",
    accentText: "#1A1305",
    accent2: "#4FC9BA",
    danger: "#E0715A",
  },
  light: {
    bg: "#EAE6D9",
    bgGrad: "radial-gradient(circle at 20% -10%, #FBF9F1 0%, #EAE6D9 55%)",
    panel: "#FFFFFF",
    panelAlt: "#F4F1E7",
    text: "#181C27",
    textMuted: "#666E82",
    border: "rgba(24,28,39,0.09)",
    accent: "#B8790C",
    accentText: "#FFF8EA",
    accent2: "#1E7F72",
    danger: "#B94B33",
  },
};

/* ---------------------------------------------------------------
   HELPERS
--------------------------------------------------------------- */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ---------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------- */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [activeCats, setActiveCats] = useState([]); // empty = all
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayTopic, setDisplayTopic] = useState("PRESS DRAW TO BEGIN");
  const [displayCat, setDisplayCat] = useState("READY");
  const [finalTopic, setFinalTopic] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [shortlist, setShortlist] = useState([]);
  const [copied, setCopied] = useState(false);
  const cancelRef = useRef(false);

  const t = THEMES[theme];

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const filteredPool = useCallback(() => {
    if (!activeCats.length) return TOPICS;
    const pool = TOPICS.filter((x) => activeCats.includes(x.c));
    return pool.length ? pool : TOPICS;
  }, [activeCats]);

  function toggleCategory(cat) {
    setActiveCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function runCycle(pool) {
    return new Promise((resolve) => {
      let steps = 0;
      const totalSteps = 26;
      let delay = 50;

      function step() {
        if (cancelRef.current) return resolve();
        const r = pickRandom(pool);
        setDisplayTopic(r.t);
        setDisplayCat(r.c);
        setAnimKey((k) => k + 1);
        steps += 1;
        if (steps < totalSteps) {
          delay = delay * 1.085;
          setTimeout(step, delay);
        } else {
          resolve();
        }
      }
      step();
    });
  }

  async function handleDraw() {
    if (isDrawing) return;
    setIsDrawing(true);
    setFinalTopic(null);
    setCopied(false);
    const pool = filteredPool();
    await runCycle(pool);
    const chosen = pickRandom(pool);
    setDisplayTopic(chosen.t);
    setDisplayCat(chosen.c);
    setAnimKey((k) => k + 1);
    setFinalTopic(chosen);
    setIsDrawing(false);
  }

  function handleSave() {
    if (!finalTopic) return;
    setShortlist((prev) =>
      prev.some((x) => x.t === finalTopic.t) ? prev : [finalTopic, ...prev].slice(0, 12)
    );
  }

  function handleCopy() {
    if (!finalTopic) return;
    const text = finalTopic.url
      ? `${finalTopic.t}\n\n${finalTopic.s}\n\n${finalTopic.url}`
      : `${finalTopic.t}\n\n${finalTopic.s}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      });
    }
  }

  function removeFromShortlist(topic) {
    setShortlist((prev) => prev.filter((x) => x.t !== topic));
  }

  return (
    <div
      className="tg-root"
      style={{
        "--bg": t.bg,
        "--bg-grad": t.bgGrad,
        "--panel": t.panel,
        "--panel-alt": t.panelAlt,
        "--text": t.text,
        "--text-muted": t.textMuted,
        "--border": t.border,
        "--accent": t.accent,
        "--accent-text": t.accentText,
        "--accent2": t.accent2,
        "--danger": t.danger,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .tg-root {
          min-height: 100vh;
          width: 100%;
          background: var(--bg-grad);
          color: var(--text);
          font-family: 'Space Grotesk', system-ui, sans-serif;
          transition: background-color .5s ease, color .5s ease;
          padding: 2.5rem 1.25rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tg-shell { width: 100%; max-width: 720px; }

        .tg-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2.75rem;
        }

        .tg-logo {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-height: 54px;
        }
        .tg-logo img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.16);
        }
        .tg-logo-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .tg-logo-title {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 0.96rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--text);
        }
        .tg-logo-sub {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          font-weight: 400;
          text-transform: uppercase;
        }

        .tg-toggle {
          position: relative;
          width: 58px;
          height: 30px;
          border-radius: 999px;
          background: var(--panel-alt);
          border: 1px solid var(--border);
          cursor: pointer;
          padding: 0;
          transition: background-color .4s ease, border-color .4s ease;
        }
        .tg-toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: transform .4s cubic-bezier(.65,0,.35,1), background-color .4s ease;
        }
        .tg-toggle.is-light .tg-toggle-knob { transform: translateX(28px); }

        .tg-board {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 38px 1.75rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
          background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 37px, var(--border) 37px, var(--border) 38px);
          transition: background-color .5s ease, border-color .5s ease;
          min-height: 190px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0;
        }

        .tg-board-cat {
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent2);
          transition: color .4s ease;
          line-height: 38px;
        }

        .tg-board-topic {
          font-family: "IBM Plex Mono", monospace;
          font-weight: 600;
          line-height: 38px;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          font-size: clamp(1.15rem, 4.4vw, 1.7rem);
          transform-origin: top center;
        }

        @keyframes flapIn {
          0% { transform: rotateX(-85deg); opacity: 0; }
          55% { transform: rotateX(8deg); opacity: 1; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        .tg-board-topic.flip { animation: flapIn .16s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .tg-board-topic.flip { animation: none; }
        }

        .tg-controls {
          margin-top: 1.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          align-items: center;
          justify-content: space-between;
        }

        .tg-cats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.4rem;
        }
        .tg-chip {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.42rem 0.75rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all .25s ease;
        }
        .tg-chip.active {
          border-color: var(--accent);
          color: var(--text);
          background: color-mix(in srgb, var(--accent) 16%, transparent);
        }
        .tg-chip:focus-visible, .tg-toggle:focus-visible, button:focus-visible {
          outline: 2px solid var(--accent2);
          outline-offset: 2px;
        }

        .tg-draw-row { margin-top: 2rem; display: flex; justify-content: center; }
        .tg-draw {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 1rem 2.6rem;
          border-radius: 999px;
          border: none;
          background: var(--accent);
          color: var(--accent-text);
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease, opacity .3s ease;
          box-shadow: 0 10px 30px color-mix(in srgb, var(--accent) 35%, transparent);
        }
        .tg-draw:hover:not(:disabled) { transform: translateY(-2px); }
        .tg-draw:disabled { opacity: 0.6; cursor: default; }

        .tg-result {
          margin-top: 1.75rem;
          background: var(--panel-alt);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.4rem 1.5rem;
          animation: riseIn .35s ease-out;
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tg-result-spark {
          font-size: 0.95rem;
          line-height: 1.55;
          color: var(--text);
        }
        .tg-result-tag {
          display: inline-block;
          margin-top: 0.7rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          color: var(--accent2);
        }
        .tg-result-actions {
          margin-top: 1.1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .tg-action {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.5rem 0.9rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--panel);
          color: var(--text);
          cursor: pointer;
          transition: border-color .25s ease, color .25s ease;
          text-decoration: none;
          display: inline-block;
        }
        .tg-action:hover { border-color: var(--accent); }

        .tg-note {
          margin-top: 0.9rem;
          font-size: 0.75rem;
          color: var(--danger);
          font-family: 'IBM Plex Mono', monospace;
        }

        .tg-shortlist {
          margin-top: 2.5rem;
        }
        .tg-shortlist-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.8rem;
        }
        .tg-shortlist-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.75rem 0.9rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-bottom: 0.55rem;
          background: var(--panel);
        }
        .tg-shortlist-item span { font-size: 0.85rem; }
        .tg-shortlist-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.95rem;
          line-height: 1;
          padding: 0.2rem 0.4rem;
        }
        .tg-shortlist-remove:hover { color: var(--danger); }

        .tg-footer {
          margin-top: 2.75rem;
          text-align: center;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.02em;
          line-height: 1.6;
        }

        @media (max-width: 480px) {
          .tg-board { padding: 1.9rem 1.2rem; }
          .tg-controls { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="tg-shell">
        <div className="tg-topbar">
          <div className="tg-logo">
            <img src="/logo.png" alt="On a Tangent logo" />
            <div className="tg-logo-text">
              <span className="tg-logo-title">On a Tangent</span>
              <span className="tg-logo-sub">a topic terminal</span>
            </div>
          </div>
          <button
            className={`tg-toggle ${theme === "light" ? "is-light" : ""}`}
            onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
            aria-label="Toggle dark or light mode"
          >
            <span className="tg-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</span>
          </button>
        </div>

        <div className="tg-board">
          <div className="tg-board-cat">{displayCat}</div>
          <div key={animKey} className="tg-board-topic flip">
            {displayTopic}
          </div>
        </div>

        <div className="tg-controls">
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
            }}
          >
            {activeCats.length ? `${activeCats.length} filter${activeCats.length > 1 ? "s" : ""} on` : "all categories"}
          </span>
        </div>

        <div className="tg-cats">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tg-chip ${activeCats.includes(cat) ? "active" : ""}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="tg-draw-row">
          <button className="tg-draw" onClick={handleDraw} disabled={isDrawing}>
            {isDrawing ? "Drawing…" : "Draw a Topic"}
          </button>
        </div>

        {finalTopic && !isDrawing && (
          <div className="tg-result">
            <div className="tg-result-spark">{finalTopic.s}</div>
            {finalTopic.difficulty && (
              <span className="tg-result-tag">
                {capitalize(finalTopic.difficulty)}
              </span>
            )}
            <div className="tg-result-actions">
              <button className="tg-action" onClick={handleDraw}>
                Draw Again
              </button>
              <button className="tg-action" onClick={handleSave}>
                Save to Shortlist
              </button>
              <button className="tg-action" onClick={handleCopy}>
                {copied ? "Copied ✓" : "Copy Topic"}
              </button>
              {finalTopic.url && (
                <a
                  className="tg-action"
                  href={finalTopic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Wikipedia ↗
                </a>
              )}
            </div>
          </div>
        )}

        {shortlist.length > 0 && (
          <div className="tg-shortlist">
            <div className="tg-shortlist-title">Shortlist ({shortlist.length})</div>
            {shortlist.map((item) => (
              <div className="tg-shortlist-item" key={item.t}>
                <span>{item.t}</span>
                <button
                  className="tg-shortlist-remove"
                  onClick={() => removeFromShortlist(item.t)}
                  aria-label={`Remove ${item.t}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="tg-footer">
          ON A TANGENT draws from 1000+ curated topics across science, history, psychology, and more.
          <br />
          All topics are family-friendly and suitable for general audiences.
        </div>
      </div>
    </div>
  );
}
