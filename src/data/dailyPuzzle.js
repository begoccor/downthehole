// ─── Daily Hole puzzle ────────────────────────────────────────────────────────
// Every day, everyone gets the same puzzle: a fixed start article and a themed
// target. Win by diving from the start until you land on an article whose title
// matches the target test. Score = hops taken; each puzzle has a curated par.

// The feature's launch epoch — Hole #1. Local midnight, matching the local-date
// rotation used everywhere else.
const EPOCH = new Date('2026-01-01T00:00:00');

export const PUZZLES = [
  { start: { en: 'Octopus', fr: 'Pieuvre', es: 'Pulpo' },
    target: { label: { en: 'the ocean', fr: 'l’océan', es: 'el océano' },
              test: { en: /\bocean\b|\bsea\b/i, fr: /océan|\bmer\b/i, es: /océano|\bmar\b/i } },
    par: 2 },
  { start: { en: 'Chess', fr: 'Échecs', es: 'Ajedrez' },
    target: { label: { en: 'a war', fr: 'une guerre', es: 'una guerra' },
              test: { en: /\bwar\b/i, fr: /guerre/i, es: /guerra/i } },
    par: 3 },
  { start: { en: 'Marie Curie', fr: 'Marie Curie', es: 'Marie Curie' },
    target: { label: { en: 'a Nobel Prize', fr: 'un prix Nobel', es: 'un premio Nobel' },
              test: { en: /nobel/i, fr: /nobel/i, es: /nobel/i } },
    par: 2 },
  { start: { en: 'Jazz', fr: 'Jazz', es: 'Jazz' },
    target: { label: { en: 'Africa', fr: 'l’Afrique', es: 'África' },
              test: { en: /africa/i, fr: /afri(que|cain)/i, es: /áfrica|african/i } },
    par: 4 },
  { start: { en: 'Volcano', fr: 'Volcan', es: 'Volcán' },
    target: { label: { en: 'Japan', fr: 'le Japon', es: 'Japón' },
              test: { en: /japan/i, fr: /japon/i, es: /japón|japon/i } },
    par: 4 },
  { start: { en: 'Honey bee', fr: 'Abeille', es: 'Abeja' },
    target: { label: { en: 'a flower', fr: 'une fleur', es: 'una flor' },
              test: { en: /flower/i, fr: /fleur/i, es: /\bflor/i } },
    par: 2 },
  { start: { en: 'Albert Einstein', fr: 'Albert Einstein', es: 'Albert Einstein' },
    target: { label: { en: 'light', fr: 'la lumière', es: 'la luz' },
              test: { en: /\blight\b/i, fr: /lumière/i, es: /\bluz\b/i } },
    par: 3 },
  { start: { en: 'The Beatles', fr: 'The Beatles', es: 'The Beatles' },
    target: { label: { en: 'India', fr: 'l’Inde', es: 'la India' },
              test: { en: /india/i, fr: /\binde\b|indien/i, es: /india/i } },
    par: 3 },
  { start: { en: 'Ancient Egypt', fr: 'Égypte antique', es: 'Antiguo Egipto' },
    target: { label: { en: 'mathematics', fr: 'les mathématiques', es: 'las matemáticas' },
              test: { en: /mathemat/i, fr: /mathémat/i, es: /matemát/i } },
    par: 4 },
  { start: { en: 'Dinosaur', fr: 'Dinosaure', es: 'Dinosaurio' },
    target: { label: { en: 'a bird', fr: 'un oiseau', es: 'un ave' },
              test: { en: /\bbird/i, fr: /oiseau/i, es: /\bave\b|aves\b|pájaro/i } },
    par: 3 },
  { start: { en: 'Coffee', fr: 'Café', es: 'Café' },
    target: { label: { en: 'Brazil', fr: 'le Brésil', es: 'Brasil' },
              test: { en: /brazil/i, fr: /brésil/i, es: /brasil/i } },
    par: 3 },
  { start: { en: 'Aurora borealis', fr: 'Aurore polaire', es: 'Aurora boreal' },
    target: { label: { en: 'the Sun', fr: 'le Soleil', es: 'el Sol' },
              test: { en: /\bsun\b|solar/i, fr: /soleil|solaire/i, es: /\bsol\b|solar/i } },
    par: 2 },
  { start: { en: 'Silk Road', fr: 'Route de la soie', es: 'Ruta de la Seda' },
    target: { label: { en: 'Italy', fr: 'l’Italie', es: 'Italia' },
              test: { en: /italy|venice/i, fr: /italie|venise/i, es: /italia|venecia/i } },
    par: 4 },
  { start: { en: 'Leonardo da Vinci', fr: 'Léonard de Vinci', es: 'Leonardo da Vinci' },
    target: { label: { en: 'anatomy', fr: 'l’anatomie', es: 'la anatomía' },
              test: { en: /anatom/i, fr: /anatom/i, es: /anatom/i } },
    par: 3 },
  { start: { en: 'Black hole', fr: 'Trou noir', es: 'Agujero negro' },
    target: { label: { en: 'relativity', fr: 'la relativité', es: 'la relatividad' },
              test: { en: /relativ/i, fr: /relativ/i, es: /relativ/i } },
    par: 2 },
  { start: { en: 'Piracy', fr: 'Piraterie', es: 'Piratería' },
    target: { label: { en: 'gold', fr: 'l’or', es: 'el oro' },
              test: { en: /\bgold\b/i, fr: /\bor\b|doré/i, es: /\boro\b/i } },
    par: 4 },
  { start: { en: 'Stonehenge', fr: 'Stonehenge', es: 'Stonehenge' },
    target: { label: { en: 'astronomy', fr: 'l’astronomie', es: 'la astronomía' },
              test: { en: /astronom/i, fr: /astronom/i, es: /astronom/i } },
    par: 3 },
  { start: { en: 'Pompeii', fr: 'Pompéi', es: 'Pompeya' },
    target: { label: { en: 'gladiators', fr: 'les gladiateurs', es: 'los gladiadores' },
              test: { en: /gladiat/i, fr: /gladiat/i, es: /gladiad/i } },
    par: 4 },
  { start: { en: 'Cleopatra', fr: 'Cléopâtre', es: 'Cleopatra' },
    target: { label: { en: 'Rome', fr: 'Rome', es: 'Roma' },
              test: { en: /\brom(e|an)/i, fr: /\brom(e|ain)/i, es: /\broma/i } },
    par: 2 },
  { start: { en: 'DNA', fr: 'Acide désoxyribonucléique', es: 'ADN' },
    target: { label: { en: 'a virus', fr: 'un virus', es: 'un virus' },
              test: { en: /\bvirus/i, fr: /\bvirus/i, es: /\bvirus/i } },
    par: 3 },
  { start: { en: 'Mars', fr: 'Mars (planète)', es: 'Marte (planeta)' },
    target: { label: { en: 'water', fr: 'l’eau', es: 'el agua' },
              test: { en: /\bwater\b/i, fr: /\beau\b/i, es: /\bagua\b/i } },
    par: 3 },
  { start: { en: 'Vincent van Gogh', fr: 'Vincent van Gogh', es: 'Vincent van Gogh' },
    target: { label: { en: 'Japan', fr: 'le Japon', es: 'Japón' },
              test: { en: /japan/i, fr: /japon/i, es: /japón|japon/i } },
    par: 3 },
  { start: { en: 'Chocolate', fr: 'Chocolat', es: 'Chocolate' },
    target: { label: { en: 'the Aztecs', fr: 'les Aztèques', es: 'los aztecas' },
              test: { en: /aztec/i, fr: /aztèque/i, es: /azteca/i } },
    par: 3 },
  { start: { en: 'Photosynthesis', fr: 'Photosynthèse', es: 'Fotosíntesis' },
    target: { label: { en: 'oxygen', fr: 'l’oxygène', es: 'el oxígeno' },
              test: { en: /oxygen/i, fr: /oxygène/i, es: /oxígeno/i } },
    par: 2 },
  { start: { en: 'Vikings', fr: 'Vikings', es: 'Vikingo' },
    target: { label: { en: 'America', fr: 'l’Amérique', es: 'América' },
              test: { en: /americ/i, fr: /améri/i, es: /améric/i } },
    par: 3 },
  { start: { en: 'Morse code', fr: 'Code Morse', es: 'Código morse' },
    target: { label: { en: 'the Titanic', fr: 'le Titanic', es: 'el Titanic' },
              test: { en: /titanic/i, fr: /titanic/i, es: /titanic/i } },
    par: 3 },
  { start: { en: 'Gravity', fr: 'Gravité', es: 'Gravedad' },
    target: { label: { en: 'the Moon', fr: 'la Lune', es: 'la Luna' },
              test: { en: /\bmoon\b|lunar/i, fr: /\blune\b|lunaire/i, es: /\bluna\b|lunar/i } },
    par: 3 },
  { start: { en: 'Renaissance', fr: 'Renaissance', es: 'Renacimiento' },
    target: { label: { en: 'printing', fr: 'l’imprimerie', es: 'la imprenta' },
              test: { en: /print/i, fr: /imprim/i, es: /imprent|impres/i } },
    par: 3 },
  { start: { en: 'Cryptography', fr: 'Cryptographie', es: 'Criptografía' },
    target: { label: { en: 'a computer', fr: 'un ordinateur', es: 'una computadora' },
              test: { en: /comput/i, fr: /ordinateur|informatique/i, es: /computad|informátic/i } },
    par: 3 },
  { start: { en: 'Amazon rainforest', fr: 'Forêt amazonienne', es: 'Selva amazónica' },
    target: { label: { en: 'medicine', fr: 'la médecine', es: 'la medicina' },
              test: { en: /medic/i, fr: /médec|médicam/i, es: /medic/i } },
    par: 4 },
  { start: { en: 'Supernova', fr: 'Supernova', es: 'Supernova' },
    target: { label: { en: 'a neutron star', fr: 'une étoile à neutrons', es: 'una estrella de neutrones' },
              test: { en: /neutron/i, fr: /neutron/i, es: /neutrón|neutron/i } },
    par: 2 },
  { start: { en: 'Tea', fr: 'Thé', es: 'Té' },
    target: { label: { en: 'Britain', fr: 'la Grande-Bretagne', es: 'Gran Bretaña' },
              test: { en: /brit/i, fr: /britann/i, es: /británic|bretaña/i } },
    par: 3 },
  { start: { en: 'Wolf', fr: 'Loup gris', es: 'Lobo' },
    target: { label: { en: 'a dog', fr: 'un chien', es: 'un perro' },
              test: { en: /\bdog\b|\bdogs\b/i, fr: /chien/i, es: /perro/i } },
    par: 2 },
  { start: { en: 'Maya civilization', fr: 'Civilisation maya', es: 'Cultura maya' },
    target: { label: { en: 'a calendar', fr: 'un calendrier', es: 'un calendario' },
              test: { en: /calendar/i, fr: /calendrier/i, es: /calendario/i } },
    par: 3 },
  { start: { en: 'Lightning', fr: 'Foudre', es: 'Rayo' },
    target: { label: { en: 'Benjamin Franklin', fr: 'Benjamin Franklin', es: 'Benjamin Franklin' },
              test: { en: /franklin/i, fr: /franklin/i, es: /franklin/i } },
    par: 3 },
  { start: { en: 'Ice age', fr: 'Âge glaciaire', es: 'Glaciación' },
    target: { label: { en: 'a mammoth', fr: 'un mammouth', es: 'un mamut' },
              test: { en: /mammoth/i, fr: /mammouth/i, es: /mamut/i } },
    par: 2 },
  { start: { en: 'Salt', fr: 'Sel alimentaire', es: 'Sal común' },
    target: { label: { en: 'Gandhi', fr: 'Gandhi', es: 'Gandhi' },
              test: { en: /gandhi/i, fr: /gandhi/i, es: /gandhi/i } },
    par: 4 },
  { start: { en: 'Mushroom', fr: 'Champignon', es: 'Hongo' },
    target: { label: { en: 'penicillin', fr: 'la pénicilline', es: 'la penicilina' },
              test: { en: /penicill/i, fr: /pénicill/i, es: /penicil/i } },
    par: 3 },
  { start: { en: 'Alphabet', fr: 'Alphabet', es: 'Alfabeto' },
    target: { label: { en: 'Phoenicia', fr: 'la Phénicie', es: 'Fenicia' },
              test: { en: /phoenic/i, fr: /phénic/i, es: /fenic/i } },
    par: 2 },
  { start: { en: 'Moon', fr: 'Lune', es: 'Luna' },
    target: { label: { en: 'the tides', fr: 'les marées', es: 'las mareas' },
              test: { en: /\btide/i, fr: /marée/i, es: /\bmarea/i } },
    par: 2 },
];

// Hole #1 = the epoch day. Uses local midnights so the puzzle flips at the
// user's local midnight, consistent with hasWonToday and the streak system.
export function getHoleNumber(now = new Date()) {
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.floor((localMidnight - EPOCH) / 86400000) + 1);
}

// Resolved puzzle for today in the given language.
export function getDailyPuzzle(lang = 'en', now = new Date()) {
  const hole   = getHoleNumber(now);
  const puzzle = PUZZLES[hole % PUZZLES.length];
  return {
    hole,
    start:  puzzle.start[lang]        ?? puzzle.start.en,
    target: {
      label: puzzle.target.label[lang] ?? puzzle.target.label.en,
      test:  puzzle.target.test[lang]  ?? puzzle.target.test.en,
    },
    par: puzzle.par,
  };
}

// ─── Daily result persistence ─────────────────────────────────────────────────
const KEY        = 'dth-daily-result';
const LEGACY_KEY = 'dth-daily-win';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? null; }
  catch { return null; }
}

export function getTodayResult() {
  const r = load();
  if (r?.date === todayStr()) return r;
  // Legacy: a win recorded before the puzzle system (no hop count)
  if (localStorage.getItem(LEGACY_KEY) === todayStr()) {
    return { date: todayStr(), hole: getHoleNumber(), hops: null, totalWins: r?.totalWins ?? 1 };
  }
  return null;
}

export function hasWonToday() {
  return getTodayResult() !== null;
}

export function getTotalDailyWins() {
  return load()?.totalWins ?? 0;
}

export function recordDailyResult(hops) {
  const prev = load();
  const result = {
    date:      todayStr(),
    hole:      getHoleNumber(),
    hops,
    totalWins: (prev?.totalWins ?? 0) + (prev?.date === todayStr() ? 0 : 1),
  };
  localStorage.setItem(KEY, JSON.stringify(result));
  return result;
}
