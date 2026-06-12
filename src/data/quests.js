import { earnCarrots } from './carrots';

// ─── Weekly quests ────────────────────────────────────────────────────────────
// 3 quests per ISO week, picked deterministically from the pool — everyone in
// the world has the same 3, like the daily puzzle. Progress lives in
// localStorage under a per-week key; old weeks are pruned.

// Event types: daily_win · depth (weekly max) · hops (count) · session (count)
//            · star (count) · creature (count)
export const QUEST_POOL = [
  { id: 'win_daily_1',  icon: '🕳️', type: 'daily_win', target: 1,  reward: 15 },
  { id: 'win_daily_3',  icon: '🏆', type: 'daily_win', target: 3,  reward: 30 },
  { id: 'depth_10',     icon: '🌌', type: 'depth',     target: 10, reward: 20 },
  { id: 'depth_15',     icon: '⛏️', type: 'depth',     target: 15, reward: 30 },
  { id: 'depth_25',     icon: '🌋', type: 'depth',     target: 25, reward: 40 },
  { id: 'hops_25',      icon: '🐾', type: 'hops',      target: 25, reward: 20 },
  { id: 'hops_50',      icon: '🐇', type: 'hops',      target: 50, reward: 30 },
  { id: 'sessions_5',   icon: '🌍', type: 'session',   target: 5,  reward: 15 },
  { id: 'sessions_10',  icon: '📚', type: 'session',   target: 10, reward: 25 },
  { id: 'star_3',       icon: '⭐', type: 'star',      target: 3,  reward: 15 },
  { id: 'star_5',       icon: '✨', type: 'star',      target: 5,  reward: 20 },
  { id: 'creature_2',   icon: '🐛', type: 'creature',  target: 2,  reward: 20 },
];

// ISO-8601 week number — same for every user regardless of locale.
export function getWeekKey(now = new Date()) {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Small deterministic PRNG so the weekly pick is stable and shared.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getActiveQuests(now = new Date()) {
  const key  = getWeekKey(now);
  const seed = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) | 0;
  const rand = mulberry32(seed);
  const pool = [...QUEST_POOL];
  // Deterministic shuffle, then take the first 3 with distinct event types
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = [];
  for (const q of pool) {
    if (picked.length === 3) break;
    if (!picked.some(p => p.type === q.type)) picked.push(q);
  }
  return picked;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
const PREFIX = 'dth-quests-';

function storageKey(now = new Date()) {
  return PREFIX + getWeekKey(now);
}

export function getQuestProgress(now = new Date()) {
  try { return JSON.parse(localStorage.getItem(storageKey(now))) ?? {}; }
  catch { return {}; }
}

function pruneOldWeeks(currentKey) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX) && k !== currentKey) localStorage.removeItem(k);
    }
  } catch { /* storage unavailable */ }
}

// Call from gameplay code whenever something quest-worthy happens.
export function recordQuestEvent(type, value = 1, now = new Date()) {
  const key      = storageKey(now);
  const active   = getActiveQuests(now).filter(q => q.type === type);
  if (active.length === 0) return;

  const progress = getQuestProgress(now);
  let changed = false;

  for (const quest of active) {
    const entry = progress[quest.id] ?? { progress: 0, done: false };
    if (entry.done) continue;
    entry.progress = type === 'depth'
      ? Math.max(entry.progress, value)
      : entry.progress + value;
    if (entry.progress >= quest.target) {
      entry.progress = quest.target;
      entry.done = true;
      earnCarrots(quest.reward, null);
      window.dispatchEvent(new CustomEvent('dth-reward', {
        detail: { type: 'quest', amount: quest.reward, questId: quest.id },
      }));
    }
    progress[quest.id] = entry;
    changed = true;
  }

  if (changed) {
    localStorage.setItem(key, JSON.stringify(progress));
    pruneOldWeeks(key);
    window.dispatchEvent(new CustomEvent('dth-quests-changed'));
  }
}
