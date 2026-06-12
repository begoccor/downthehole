import { earnCarrots } from './carrots';
import { recordQuestEvent } from './quests';

// ─── Creature album ───────────────────────────────────────────────────────────
// The pixel creatures that live down the hole. Common ones always show up once
// you reach their depth; rare ones roll a spawn chance once per session.

export const CREATURES = [
  { id: 'worm',      minDepth: 2,  chance: 1,    rarity: 'common' },
  { id: 'beetle',    minDepth: 4,  chance: 1,    rarity: 'common' },
  { id: 'mole',      minDepth: 8,  chance: 1,    rarity: 'common' },
  { id: 'centipede', minDepth: 12, chance: 1,    rarity: 'common' },
  { id: 'spider',    minDepth: 15, chance: 1,    rarity: 'common' },
  { id: 'trilobite', minDepth: 16, chance: 0.25, rarity: 'rare' },
  { id: 'golem',     minDepth: 25, chance: 0.2,  rarity: 'rare' },
  { id: 'axolotl',   minDepth: 5,  chance: 0.05, rarity: 'legendary' },
];

const KEY = 'dth-creatures';

export function getCreatureLog() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; }
  catch { return {}; }
}

export function isAlbumComplete() {
  const log = getCreatureLog();
  return CREATURES.every(c => log[c.id]);
}

// Roll the per-session spawns for the rare creatures. Called once when a
// session starts; the result decides which rares can appear this dive.
export function rollSessionSpawns() {
  const spawns = {};
  for (const c of CREATURES) spawns[c.id] = c.chance >= 1 || Math.random() < c.chance;
  return spawns;
}

// Record a meeting (once per session per creature — the caller guards that).
// First-ever meetings pay 5 carrots and count toward creature quests.
export function recordCreatureMeeting(id) {
  const log   = getCreatureLog();
  const first = !log[id];
  log[id] = {
    firstMet:  log[id]?.firstMet ?? new Date().toISOString(),
    timesSeen: (log[id]?.timesSeen ?? 0) + 1,
  };
  localStorage.setItem(KEY, JSON.stringify(log));
  window.dispatchEvent(new CustomEvent('dth-creatures-changed'));
  if (first) {
    earnCarrots(5, null);
    recordQuestEvent('creature');
    window.dispatchEvent(new CustomEvent('dth-reward', {
      detail: { type: 'creature', amount: 5, creatureId: id },
    }));
  }
  return { first };
}
