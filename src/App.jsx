import { useState, useRef, useEffect, useCallback } from "react";

/* ---------------------------------------------------------------
   TOPIC LIBRARY — 140 curated topics across 14 categories
--------------------------------------------------------------- */
const TOPICS = [
  // Science
  { t: "Bioluminescence: how and why living things glow", c: "Science", s: "What evolutionary pressure makes an organism spend energy to light itself up?" },
  { t: "CRISPR gene editing and its ethical frontiers", c: "Science", s: "If we can edit the code of life, who decides what counts as an improvement?" },
  { t: "How vaccines train the immune system", c: "Science", s: "How does showing the body a fake threat prepare it for a real one?" },
  { t: "The gut microbiome's influence on mood and behavior", c: "Science", s: "Could the trillions of microbes in your gut be quietly steering your emotions?" },
  { t: "Epigenetics: how experience changes gene expression", c: "Science", s: "Can a grandparent's stress leave a mark on genes passed down to grandchildren?" },
  { t: "The chemistry of flavor and why cilantro tastes like soap to some", c: "Science", s: "Why does the exact same herb taste like a garden to one person and a bar of soap to another?" },
  { t: "Why yawning is contagious", c: "Science", s: "What does a reflex we can't fully explain say about empathy in the brain?" },
  { t: "The physics of why the sky is blue", c: "Science", s: "Why does scattered sunlight paint the whole sky one color and not another?" },
  { t: "Superconductivity and the race for a room-temperature superconductor", c: "Science", s: "What would change if electricity could flow with zero resistance at everyday temperatures?" },
  { t: "The science of aging and animals that barely age at all", c: "Science", s: "What can a naked mole rat or a Greenland shark teach us about slowing down aging?" },

  // Psychology
  { t: "The Dunning-Kruger effect and the confidence of the unskilled", c: "Psychology", s: "Why are people with the least skill sometimes the most sure of themselves?" },
  { t: "Why we remember embarrassing moments more vividly than proud ones", c: "Psychology", s: "Why does memory seem to file cringe under 'urgent' and pride under 'optional'?" },
  { t: "The bystander effect and diffusion of responsibility", c: "Psychology", s: "Why does a crowd of witnesses sometimes make help less likely, not more?" },
  { t: "How childhood attachment styles shape adult relationships", c: "Psychology", s: "Can the way you were comforted as a toddler predict how you argue as an adult?" },
  { t: "The psychology of procrastination", c: "Psychology", s: "Why do we delay the very things we know will make us feel better?" },
  { t: "Cognitive dissonance and how we justify our choices", c: "Psychology", s: "How far will the mind bend the truth just to feel consistent with itself?" },
  { t: "The Zeigarnik effect: why unfinished tasks stick in memory", c: "Psychology", s: "Why does an open task nag at you louder than a dozen finished ones?" },
  { t: "Groupthink and why smart people make bad decisions together", c: "Psychology", s: "How does a room full of intelligent people talk itself into an obviously bad plan?" },
  { t: "The illusion of control in games of chance", c: "Psychology", s: "Why do people believe they can influence a dice roll just by throwing it harder?" },
  { t: "Why nostalgia feels bittersweet", c: "Psychology", s: "Why does missing something that's gone come with both comfort and ache?" },

  // History
  { t: "The Library of Alexandria and what was truly lost", c: "History", s: "How much of the ancient world's knowledge actually vanished, and how do we know?" },
  { t: "How the printing press reshaped European society", c: "History", s: "Could one mechanical invention really help spark the Reformation and the Renaissance?" },
  { t: "The Silk Road as an engine of cultural exchange", c: "History", s: "What traveled along those trade routes besides silk — and how did it change the world?" },
  { t: "The fall of the Roman Empire: causes still debated", c: "History", s: "Was Rome's collapse one dramatic fall, or a centuries-long slow leak?" },
  { t: "The Black Death's role in ending feudalism", c: "History", s: "How did a pandemic end up giving surviving peasants more bargaining power?" },
  { t: "Women codebreakers of World War II", c: "History", s: "Why did thousands of women who cracked Axis codes stay secret for decades after?" },
  { t: "The history of the number zero", c: "History", s: "How did 'nothing' become one of the most consequential inventions in mathematics?" },
  { t: "How the Columbian Exchange reshaped global diets", c: "History", s: "What did Italy eat before the tomato, or Ireland before the potato?" },
  { t: "The Great Wall of China across dynasties", c: "History", s: "Was the Great Wall really one wall, or many walls built centuries apart for different reasons?" },
  { t: "The surprising origins of everyday inventions", c: "History", s: "How many objects on your desk were invented for a completely different purpose?" },

  // Philosophy
  { t: "The Ship of Theseus and the nature of identity", c: "Philosophy", s: "If every part of something is replaced over time, is it still the same thing?" },
  { t: "Simulation theory: are we living in a computed reality", c: "Philosophy", s: "Is there any experiment that could actually tell us whether reality is simulated?" },
  { t: "The trolley problem and the ethics of action versus inaction", c: "Philosophy", s: "Is choosing not to act still a choice with moral weight?" },
  { t: "Free will versus determinism", c: "Philosophy", s: "If every choice follows from prior causes, in what sense is it really a choice?" },
  { t: "The Chinese Room argument and machine understanding", c: "Philosophy", s: "Can a system that perfectly mimics understanding be said to understand anything at all?" },
  { t: "Utilitarianism versus deontology in moral decision-making", c: "Philosophy", s: "Should the rightness of an act depend on its outcome, or on the rule it follows?" },
  { t: "The problem of other minds", c: "Philosophy", s: "How do you actually know anyone else has an inner experience like yours?" },
  { t: "Zeno's paradoxes of motion", c: "Philosophy", s: "How can an arrow ever hit its target if it must first cross half the distance, forever?" },
  { t: "The is-ought problem in ethics", c: "Philosophy", s: "Can you ever derive what should be true purely from what is true?" },
  { t: "Nihilism versus existentialism", c: "Philosophy", s: "If the universe has no built-in meaning, does that free us or strand us?" },

  // Space
  { t: "The Fermi Paradox: where is everybody?", c: "Space", s: "If the universe is so vast and old, why haven't we found any sign of anyone else?" },
  { t: "How black holes bend space and time", c: "Space", s: "What actually happens to time as you approach the edge of a black hole?" },
  { t: "The search for habitable exoplanets", c: "Space", s: "What exactly are astronomers looking for to call a distant planet 'habitable'?" },
  { t: "What long-term spaceflight does to the human body", c: "Space", s: "What happens to bones, eyes, and the mind after a year with no gravity?" },
  { t: "The Voyager probes and the golden record", c: "Space", s: "What would you put on a record meant to represent all of humanity to an alien?" },
  { t: "Dark matter: the universe's missing mass", c: "Space", s: "How do we study something we've never directly seen and can't touch?" },
  { t: "The James Webb Telescope's view into the early universe", c: "Space", s: "How can a telescope let us literally see light from near the beginning of time?" },
  { t: "Tidal locking and why we only see one side of the Moon", c: "Space", s: "Why does the Moon always show us the same face, night after night?" },
  { t: "The possibility of life in Europa's subsurface ocean", c: "Space", s: "What makes a frozen moon of Jupiter one of the best bets for finding life nearby?" },
  { t: "How stars are born and die", c: "Space", s: "Why does the death of a massive star scatter the very elements that make up our bodies?" },

  // Technology
  { t: "The history and architecture of the internet", c: "Technology", s: "How does a message actually get from your phone to a server across the world?" },
  { t: "How encryption keeps the modern world secure", c: "Technology", s: "How can two strangers agree on a secret code in plain sight of an eavesdropper?" },
  { t: "How large language models actually work", c: "Technology", s: "How does predicting the next word produce something that reads like reasoning?" },
  { t: "The ethics of facial recognition technology", c: "Technology", s: "Where should the line sit between public safety and being tracked without consent?" },
  { t: "Quantum computing: promise and current limits", c: "Technology", s: "Why is a quantum computer good at some problems and no better at most everyday ones?" },
  { t: "How GPS actually works", c: "Technology", s: "Why do GPS satellites need to correct for Einstein's relativity just to stay accurate?" },
  { t: "The environmental cost of data centers", c: "Technology", s: "What does it actually take, in water and electricity, to keep the cloud running?" },
  { t: "Self-driving cars and real-world trolley problems", c: "Technology", s: "How do engineers actually program a car to make split-second ethical trade-offs?" },
  { t: "The rise of the video game industry", c: "Technology", s: "How did games go from a niche hobby to a bigger business than film and music combined?" },
  { t: "Open-source software and the culture that built the internet", c: "Technology", s: "Why do thousands of people volunteer to build software they give away for free?" },

  // Nature
  { t: "Mycelium networks: the 'wood wide web' beneath forests", c: "Nature", s: "Could a forest floor be a communication network, with trees trading resources underground?" },
  { t: "The migration of monarch butterflies", c: "Nature", s: "How does a butterfly that's never made the trip before know exactly where to go?" },
  { t: "How octopuses think with nine brains", c: "Nature", s: "What does it mean for intelligence when each arm can seemingly think for itself?" },
  { t: "The role of keystone species in ecosystems", c: "Nature", s: "How can removing one species unravel an entire ecosystem?" },
  { t: "Coral reef bleaching and ocean acidification", c: "Nature", s: "Why does warmer, more acidic water cause corals to expel the algae that keep them alive?" },
  { t: "Tool use in crows and chimpanzees", c: "Nature", s: "What does it take for a species with no hands to still bend the world to its will?" },
  { t: "The science of camouflage and mimicry", c: "Nature", s: "How does evolution turn a harmless insect into a near-perfect copy of a dangerous one?" },
  { t: "How trees communicate and share resources", c: "Nature", s: "Do trees really warn each other about danger, and if so, how?" },
  { t: "The extremophiles that survive in impossible conditions", c: "Nature", s: "What kind of life can thrive in boiling acid, crushing pressure, or total darkness?" },
  { t: "Rewilding: restoring ecosystems by reintroducing predators", c: "Nature", s: "How did returning wolves to Yellowstone end up reshaping the course of its rivers?" },

  // Mathematics
  { t: "The Fibonacci sequence in nature", c: "Mathematics", s: "Why does one simple number pattern keep showing up in sunflowers, shells, and pinecones?" },
  { t: "Why prime numbers still fascinate mathematicians", c: "Mathematics", s: "Why is there still no simple formula for predicting the next prime number?" },
  { t: "The Monty Hall problem and probability intuition", c: "Mathematics", s: "Why does switching doors actually double your odds, even though it feels wrong?" },
  { t: "Fractals and infinite complexity from simple rules", c: "Mathematics", s: "How can a shape have infinite detail while being built from one repeated rule?" },
  { t: "Gödel's incompleteness theorems", c: "Mathematics", s: "Why did one proof show that any sufficiently powerful math system can't prove everything true within it?" },
  { t: "Fermat's Last Theorem and 358 years to prove it", c: "Mathematics", s: "What does it take to solve a problem simple enough to state in one line and hard enough to defy centuries of mathematicians?" },
  { t: "Game theory and the prisoner's dilemma", c: "Mathematics", s: "Why can two purely rational people both end up choosing the worse outcome?" },
  { t: "The mathematics of voting systems and fairness", c: "Mathematics", s: "Is there such a thing as a truly fair voting system, mathematically speaking?" },
  { t: "Chaos theory and the butterfly effect", c: "Mathematics", s: "How can a tiny, unmeasurable difference completely change a system's long-term future?" },
  { t: "The four-color map theorem", c: "Mathematics", s: "Why does any map, no matter how complex, only ever need four colors to avoid touching same-colored regions?" },

  // Economics
  { t: "Why inflation happens and how central banks fight it", c: "Economics", s: "What actually happens in an economy that makes the same dollar buy less over time?" },
  { t: "The tragedy of the commons", c: "Economics", s: "Why do shared resources tend to get overused even when everyone knows the risk?" },
  { t: "Behavioral economics and irrational decision-making", c: "Economics", s: "Why do people consistently make choices that go against their own stated interests?" },
  { t: "The gig economy's impact on traditional employment", c: "Economics", s: "Is flexible, app-based work a form of freedom or a rollback of worker protections?" },
  { t: "Cryptocurrency and the promise of decentralized finance", c: "Economics", s: "What problem was cryptocurrency actually trying to solve, and has it succeeded?" },
  { t: "The economics of fast fashion", c: "Economics", s: "How is a t-shirt made cheap enough to be nearly disposable, and what's the real cost?" },
  { t: "Universal basic income: pilot results and debates", c: "Economics", s: "What actually happens to work, spending, and wellbeing when people get no-strings-attached cash?" },
  { t: "Why diamonds cost more than water, even though water sustains life", c: "Economics", s: "How can something essential to survival be worth less than something purely decorative?" },
  { t: "The history of the global supply chain", c: "Economics", s: "How did a single shipping container change the cost of nearly everything you own?" },
  { t: "Wealth inequality and the economics of opportunity", c: "Economics", s: "How much does where you're born still determine how far you can go?" },

  // Culture & Arts
  { t: "The evolution of street art from vandalism to gallery pieces", c: "Culture & Arts", s: "What changes when the same act goes from being arrested for to auctioned for millions?" },
  { t: "How color theory shapes emotional response in film", c: "Culture & Arts", s: "Why do filmmakers reach for orange and teal, or a washed-out grey, to set a mood?" },
  { t: "Jazz as a form of resistance", c: "Culture & Arts", s: "How did an improvised art form become a language of protest and identity?" },
  { t: "Why certain songs get stuck in our heads", c: "Culture & Arts", s: "What makes a melody loop in your mind for hours against your will?" },
  { t: "The role of censorship in shaping art movements", c: "Culture & Arts", s: "Can restriction sometimes push artists toward more creative, coded expression?" },
  { t: "The cultural history of tattoos across civilizations", c: "Culture & Arts", s: "How has the same act of marking skin meant status in one culture and shame in another?" },
  { t: "How fashion trends cycle and predict the future", c: "Culture & Arts", s: "Why do styles from decades ago keep resurfacing as 'new'?" },
  { t: "The psychology of why we cry at movies", c: "Culture & Arts", s: "Why does a story we know is fictional still bring on real tears?" },
  { t: "The history and revival of vinyl records", c: "Culture & Arts", s: "Why are people choosing an imperfect, decades-old format over perfect digital audio?" },
  { t: "Museum ethics and the repatriation of cultural artifacts", c: "Culture & Arts", s: "Who actually has the right to hold and display an object taken from another culture?" },

  // Mythology & Folklore
  { t: "The flood myth found across nearly every culture", c: "Mythology & Folklore", s: "Why do civilizations with no contact with each other share strikingly similar flood stories?" },
  { t: "Trickster gods across world mythologies", c: "Mythology & Folklore", s: "Why does nearly every mythology include a figure who breaks the rules on purpose?" },
  { t: "The origins of vampire and werewolf legends", c: "Mythology & Folklore", s: "What real fears or misunderstood illnesses might have birthed these monster myths?" },
  { t: "Why dragons appear in almost every culture's folklore", c: "Mythology & Folklore", s: "How did unrelated civilizations independently dream up something so similar to a dragon?" },
  { t: "Fae folklore and the rules of dealing with fairies", c: "Mythology & Folklore", s: "Why do so many old fairy tales come with strict, almost legalistic rules for survival?" },
  { t: "Norse mythology and the concept of Ragnarok", c: "Mythology & Folklore", s: "Why did the Norse imagine even their gods as doomed to eventually lose?" },
  { t: "The real history behind Atlantis legends", c: "Mythology & Folklore", s: "Was Atlantis pure invention, or could it be a distorted memory of a real disaster?" },
  { t: "Ghost stories as a cultural way of processing grief", c: "Mythology & Folklore", s: "Why do so many cultures independently invent stories of the dead who linger?" },
  { t: "The mythology of the underworld across civilizations", c: "Mythology & Folklore", s: "Why do so many religions imagine a journey, a river, or a gate guarding the afterlife?" },
  { t: "Folk medicine and the knowledge behind old wives' tales", c: "Mythology & Folklore", s: "How many 'old wives' tales' turn out to have a real, if crude, scientific basis?" },

  // Sports
  { t: "The science of peak athletic performance", c: "Sports", s: "What actually separates an elite athlete's body and mind from everyone else's?" },
  { t: "How doping scandals changed sports regulation", c: "Sports", s: "How did the fight against doping turn into an ongoing arms race between chemists and testers?" },
  { t: "The economics of the modern Olympics", c: "Sports", s: "Why do host cities keep bidding for an event that so often loses money?" },
  { t: "The evolution of basketball strategy into the pace-and-space era", c: "Sports", s: "How did one statistical insight about the three-point shot reshape an entire sport?" },
  { t: "Sports psychology and the 'flow state'", c: "Sports", s: "What is actually happening in the brain when an athlete describes the game 'slowing down'?" },
  { t: "The history of the marathon and its brutal origin", c: "Sports", s: "Why does a 26.2-mile race trace back to a legend that ends in the runner's death?" },
  { t: "How technology is changing officiating in sports", c: "Sports", s: "Does instant replay and sensor tracking make sports fairer, or just slower?" },
  { t: "The rise of esports as a legitimate sport", c: "Sports", s: "What does it take for competitive video gaming to be treated like a 'real' sport?" },
  { t: "Home field advantage: is it real, and why", c: "Sports", s: "How much of a team's edge at home actually comes down to crowd noise and travel?" },
  { t: "The Paralympic movement and adaptive sports innovation", c: "Sports", s: "How has adaptive equipment pushed the boundaries of what athletic performance even means?" },

  // Linguistics
  { t: "How languages die and efforts to revive them", c: "Linguistics", s: "What is actually lost when a language's last fluent speaker passes away?" },
  { t: "The Sapir-Whorf hypothesis: does language shape thought", c: "Linguistics", s: "Could the language you speak actually change how you perceive color, time, or space?" },
  { t: "The origin and spread of the world's writing systems", c: "Linguistics", s: "How many times in history did humans independently invent the idea of writing?" },
  { t: "Why some languages have many words for one concept", c: "Linguistics", s: "What does a language's vocabulary reveal about what a culture pays close attention to?" },
  { t: "Constructed languages, from Esperanto to Klingon", c: "Linguistics", s: "What does it take to invent a language from scratch, and why do people bother?" },
  { t: "Code-switching and bilingual identity", c: "Linguistics", s: "Why do bilingual speakers sometimes feel like a slightly different person in each language?" },
  { t: "The evolution of internet slang and emoji as language", c: "Linguistics", s: "Are emoji becoming a genuine writing system, or just decoration on top of one?" },
  { t: "Untranslatable words and what they reveal about culture", c: "Linguistics", s: "What does it mean that some feelings have a word in one language and no equivalent in another?" },
  { t: "How children acquire language so effortlessly", c: "Linguistics", s: "Why can a toddler master grammar rules that trip up adult language learners?" },
  { t: "Lost and undeciphered ancient scripts", c: "Linguistics", s: "What would it take to finally crack a writing system like Linear A or Rongorongo?" },

  // Design & Architecture
  { t: "Brutalist architecture: love it or hate it", c: "Design & Architecture", s: "Why does raw, blocky concrete architecture provoke such strong reactions decades later?" },
  { t: "The psychology of color in branding", c: "Design & Architecture", s: "How does a single color choice quietly shape how much you trust a brand?" },
  { t: "How Ikea's flat-pack design changed furniture forever", c: "Design & Architecture", s: "What design decision let a couch fit through your front door in a box the size of a pizza?" },
  { t: "Biomimicry: design inspired by nature", c: "Design & Architecture", s: "How many modern inventions started by copying a shape or trick evolution figured out first?" },
  { t: "The history of the skyscraper and the race to build tall", c: "Design & Architecture", s: "What breakthrough actually made it possible to build hundreds of stories into the sky?" },
  { t: "Urban planning and the 15-minute city concept", c: "Design & Architecture", s: "What would change about daily life if everything you needed was a 15-minute walk away?" },
  { t: "Typography's hidden influence on how we read", c: "Design & Architecture", s: "Can the shape of letters actually change how quickly and accurately we understand a sentence?" },
  { t: "The design of everyday objects and hidden affordances", c: "Design & Architecture", s: "Why do so many doors trick you into pushing when you should pull?" },
  { t: "Sacred geometry in historical architecture", c: "Design & Architecture", s: "Why do so many ancient sacred buildings rely on the same recurring geometric ratios?" },
  { t: "How video game level design guides players without words", c: "Design & Architecture", s: "How does a game teach you its rules using only light, color, and layout, with no instructions?" },
];

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
