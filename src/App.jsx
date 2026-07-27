import { useState, useRef, useEffect, useCallback } from "react";
import { TOPICS_1000 } from "./topic_list";

/* ---------------------------------------------------------------
   TOPIC LIBRARY — 140 curated topics across 14 categories
--------------------------------------------------------------- */
const TOPICS = [...TOPICS_1000];

const CATEGORIES = [...new Set(TOPICS.map((x) => x.c))];

/* ---------------------------------------------------------------
   ATLAS (WIKIPEDIA) INTEGRATION
   Uses Wikipedia's public REST + Action APIs directly from the
   browser. No key needed, CORS-enabled, works from any host.
--------------------------------------------------------------- */
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1";
const WIKI_ACTION = "https://en.wikipedia.org/w/api.php";

// Maps our own category labels to real Wikipedia category names
const CATEGORY_WIKI_MAP = {
  "Science": ["Science"],
  "Psychology": ["Psychology"],
  "History": ["History"],
  "Philosophy": ["Philosophy"],
  "Space": ["Astronomy", "Space exploration"],
  "Technology": ["Technology"],
  "Nature": ["Nature", "Ecology"],
  "Mathematics": ["Mathematics"],
  "Economics": ["Economics"],
  "Culture & Arts": ["The arts", "Culture"],
  "Mythology & Folklore": ["Mythology", "Folklore"],
  "Sports": ["Sports"],
  "Linguistics": ["Linguistics"],
  "Design & Architecture": ["Architecture", "Design"],
};

const DIFFICULTIES = [
  { id: "surface", label: "Surface", hint: "Quick, approachable topics" },
  { id: "current", label: "Current", hint: "Solid middle-depth topics" },
  { id: "deep", label: "Deep", hint: "Dense, research-heavy topics" },
];

// Best-effort content filter — not exhaustive, but screens out
// obvious explicit or graphic material before it reaches the board.
const BLOCKED_TERMS = [
  "pornograph", "explicit sexual", "sexual intercourse", "hardcore sex",
  "genitalia", "rape", "sexual assault", "child abuse", "torture",
  "mutilat", "gore", "snuff film", "necrophilia", "bestiality",
  "gruesome execution", "decapitation",
];

const LOW_VALUE_PATTERNS = [
  "is a species of",
  "is a genus of",
  "is a moth",
  "is a beetle",
  "is a village in",
  "is a municipality in",
  "is a census-designated place",
  "is a small town in",
];

function containsBlockedContent(text) {
  const lower = (text || "").toLowerCase();
  return BLOCKED_TERMS.some((term) => lower.includes(term));
}

function isLowValueTopic(text) {
  const lower = (text || "").toLowerCase();
  return LOW_VALUE_PATTERNS.some((term) => lower.includes(term));
}

function getDifficultyBand(extractText) {
  const len = (extractText || "").length;
  if (len < 500) return "surface";
  if (len < 1200) return "current";
  return "deep";
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function wikiTitleToSlug(title) {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

async function wikiFetchJson(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("wiki request failed");
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

async function fetchWikiRandomSummary() {
  return wikiFetchJson(`${WIKI_REST}/page/random/summary`);
}

async function fetchWikiSummaryByTitle(title) {
  return wikiFetchJson(`${WIKI_REST}/page/summary/${wikiTitleToSlug(title)}`);
}

const EXCLUDED_WIKI_CATEGORIES = [
  "Towns",
  "Species",
  "Year of birth missing",
  "Year of birth uncertain",
];

async function fetchWikiCategoryTitles(categories) {
  const wikiCats = [...new Set(categories.flatMap((c) => CATEGORY_WIKI_MAP[c] || []))];
  if (!wikiCats.length) return [];
  const include = wikiCats.length === 1
    ? `deepcategory:"${wikiCats[0]}"`
    : `(${wikiCats.map((c) => `deepcategory:"${c}"`).join(" OR ")})`;
  const exclude = EXCLUDED_WIKI_CATEGORIES.map((c) => `-deepcategory:"${c}"`).join(" ");
  const expr = `${include} ${exclude}`;
  const url = `${WIKI_ACTION}?action=query&list=search&format=json&origin=*&srnamespace=0&srlimit=50&srsearch=${encodeURIComponent(expr)}`;
  const data = await wikiFetchJson(url);
  return (data && data.query && data.query.search ? data.query.search : []).map((r) => r.title);
}

const MIN_EXTRACT_LENGTH = 200;

function summaryToTopic(summary, fallbackCategory) {
  if (!summary || summary.type === "disambiguation" || !summary.extract) return null;
  const combined = `${summary.title} ${summary.description || ""} ${summary.extract}`;
  if (containsBlockedContent(combined)) return null;
  const extract = summary.extract.trim();
  if (extract.length < MIN_EXTRACT_LENGTH) return null;
  if (isLowValueTopic(combined)) return null;
}

async function fetchAtlasTopic(categories, difficulty) {
  const maxAttempts = 10;
  let candidateTitles = [];
  if (categories.length) {
    candidateTitles = await fetchWikiCategoryTitles(categories);
    if (!candidateTitles.length) throw new Error("no category matches on the atlas");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let summary = null;
    if (candidateTitles.length) {
      const title = candidateTitles[Math.floor(Math.random() * candidateTitles.length)];
      summary = await fetchWikiSummaryByTitle(title).catch(() => null);
    } else {
      summary = await fetchWikiRandomSummary().catch(() => null);
    }
    if (!summary) continue;
    const topic = summaryToTopic(summary, categories[0] || "ATLAS");
    if (!topic) continue;
    if (difficulty && topic.difficulty !== difficulty) continue;
    return topic;
  }
  throw new Error("no matching atlas topic found");
}

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
  const [source, setSource] = useState("archive"); // 'archive' | 'atlas'
  const [activeCats, setActiveCats] = useState([]); // empty = all
  const [difficulty, setDifficulty] = useState(null); // null = any
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayTopic, setDisplayTopic] = useState("PRESS DRAW TO BEGIN");
  const [displayCat, setDisplayCat] = useState("READY");
  const [finalTopic, setFinalTopic] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [shortlist, setShortlist] = useState([]);
  const [atlasNote, setAtlasNote] = useState("");
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

  function toggleDifficulty(id) {
    setDifficulty((prev) => (prev === id ? null : id));
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
    setAtlasNote("");
    setCopied(false);

    const pool = filteredPool();
    const atlasPromise =
      source === "atlas" ? fetchAtlasTopic(activeCats, difficulty).catch(() => null) : null;

    await runCycle(pool);

    let chosen = null;
    if (source === "atlas") {
      chosen = await atlasPromise;
      if (!chosen) {
        setAtlasNote("The atlas didn't turn up a match — pulled from the archive instead.");
        chosen = pickRandom(pool);
      }
    } else {
      chosen = pickRandom(pool);
    }

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
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 1.05rem;
          letter-spacing: 0.28em;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
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
          padding: 2.4rem 1.75rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 37px,
            var(--border) 37px,
            var(--border) 38px
          );
          transition: background-color .5s ease, border-color .5s ease;
          min-height: 190px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.9rem;
        }

        .tg-board-cat {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent2);
          transition: color .4s ease;
        }

        .tg-board-topic {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          line-height: 1.28;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          font-size: clamp(1.15rem, 4.4vw, 1.85rem);
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

        .tg-source {
          display: inline-flex;
          background: var(--panel-alt);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 3px;
        }
        .tg-source button {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: none;
          background: transparent;
          color: var(--text-muted);
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background-color .3s ease, color .3s ease;
        }
        .tg-source button.active {
          background: var(--accent);
          color: var(--accent-text);
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

        .tg-diff-section {
          margin-top: 1.6rem;
          transition: opacity .3s ease;
        }
        .tg-diff-section.muted { opacity: 0.5; }
        .tg-diff-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.55rem;
        }
        .tg-diff-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tg-diff-chip {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.42rem 0.8rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all .25s ease;
        }
        .tg-diff-chip.active {
          border-color: var(--accent2);
          color: var(--text);
          background: color-mix(in srgb, var(--accent2) 16%, transparent);
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
          .tg-source { align-self: flex-start; }
        }
      `}</style>

      <div className="tg-shell">
        <div className="tg-topbar">
          <div className="tg-logo">
            TANGENT
            <span className="tg-logo-sub">a topic terminal</span>
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
          <div className="tg-source">
            <button
              className={source === "archive" ? "active" : ""}
              onClick={() => setSource("archive")}
            >
              Archive
            </button>
            <button
              className={source === "atlas" ? "active" : ""}
              onClick={() => setSource("atlas")}
            >
              Atlas
            </button>
          </div>
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

        <div className={`tg-diff-section ${source !== "atlas" ? "muted" : ""}`}>
          <div className="tg-diff-label">
            Research depth {source !== "atlas" ? "· used in Atlas mode" : ""}
          </div>
          <div className="tg-diff-row">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                className={`tg-diff-chip ${difficulty === d.id ? "active" : ""}`}
                onClick={() => toggleDifficulty(d.id)}
                title={d.hint}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tg-draw-row">
          <button className="tg-draw" onClick={handleDraw} disabled={isDrawing}>
            {isDrawing ? "Drawing…" : "Draw a Topic"}
          </button>
        </div>

        {atlasNote && <div className="tg-note">{atlasNote}</div>}

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
          Archive mode draws from 140+ curated topics across science, history, psychology, and more.
          <br />
          Atlas mode pulls live topics from Wikipedia, narrowed by your category and depth filters.
          <br />
          Content filtering is best-effort — always sanity-check a topic before presenting it.
        </div>
      </div>
    </div>
  );
}
