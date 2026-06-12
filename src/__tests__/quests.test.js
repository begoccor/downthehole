import { describe, it, expect, beforeEach, vi } from 'vitest';

// Minimal browser stubs for the node test environment
const store = new Map();
vi.stubGlobal('localStorage', {
  getItem:   (k) => store.get(k) ?? null,
  setItem:   (k, v) => store.set(k, String(v)),
  removeItem:(k) => store.delete(k),
  clear:     () => store.clear(),
  get length() { return store.size; },
  key: (i) => [...store.keys()][i] ?? null,
});
const dispatched = [];
vi.stubGlobal('window', {
  dispatchEvent: (e) => dispatched.push(e),
  addEventListener: () => {},
  removeEventListener: () => {},
});
if (typeof globalThis.CustomEvent === 'undefined') {
  vi.stubGlobal('CustomEvent', class { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } });
}

const { QUEST_POOL, getWeekKey, getActiveQuests, getQuestProgress, recordQuestEvent } =
  await import('../data/quests.js');
const { getCarrots } = await import('../data/carrots.js');

describe('getWeekKey', () => {
  it('computes ISO week keys', () => {
    expect(getWeekKey(new Date('2026-01-01T12:00:00'))).toBe('2026-W01');
    expect(getWeekKey(new Date('2026-06-10T12:00:00'))).toBe('2026-W24');
  });

  it('is the same for every day within a week', () => {
    // 2026-06-08 (Mon) through 2026-06-14 (Sun)
    expect(getWeekKey(new Date('2026-06-08T00:01:00')))
      .toBe(getWeekKey(new Date('2026-06-14T23:59:00')));
  });

  it('changes between weeks', () => {
    expect(getWeekKey(new Date('2026-06-07T12:00:00')))
      .not.toBe(getWeekKey(new Date('2026-06-08T12:00:00')));
  });
});

describe('getActiveQuests', () => {
  it('picks exactly 3 quests with distinct event types', () => {
    const quests = getActiveQuests(new Date('2026-06-10T12:00:00'));
    expect(quests).toHaveLength(3);
    expect(new Set(quests.map(q => q.type)).size).toBe(3);
    for (const q of quests) expect(QUEST_POOL).toContainEqual(q);
  });

  it('is deterministic within a week', () => {
    const a = getActiveQuests(new Date('2026-06-08T09:00:00'));
    const b = getActiveQuests(new Date('2026-06-14T21:00:00'));
    expect(a.map(q => q.id)).toEqual(b.map(q => q.id));
  });
});

describe('recordQuestEvent', () => {
  const now = new Date('2026-06-10T12:00:00');

  beforeEach(() => {
    store.clear();
    dispatched.length = 0;
  });

  it('accumulates count-type progress', () => {
    const counting = getActiveQuests(now).find(q => q.type !== 'depth');
    if (!counting) return; // weekly pick could in theory be all-depth; pool prevents it
    recordQuestEvent(counting.type, 1, now);
    expect(getQuestProgress(now)[counting.id].progress).toBe(1);
  });

  it('tracks the weekly max for depth quests', () => {
    const depthQuest = getActiveQuests(now).find(q => q.type === 'depth');
    if (!depthQuest) return; // not in this week's rotation
    recordQuestEvent('depth', 4, now);
    recordQuestEvent('depth', 2, now);
    expect(getQuestProgress(now)[depthQuest.id].progress).toBe(4);
  });

  it('completes a quest, pays carrots, and announces it once', () => {
    const quest = getActiveQuests(now)[0];
    const before = getCarrots();
    for (let i = 0; i < quest.target + 3; i++) {
      recordQuestEvent(quest.type, quest.type === 'depth' ? quest.target : 1, now);
    }
    const entry = getQuestProgress(now)[quest.id];
    expect(entry.done).toBe(true);
    expect(entry.progress).toBe(quest.target);
    expect(getCarrots()).toBe(before + quest.reward);
    const questToasts = dispatched.filter(e => e.type === 'dth-reward' && e.detail?.questId === quest.id);
    expect(questToasts).toHaveLength(1);
  });

  it('ignores event types with no active quest this week', () => {
    const activeTypes = new Set(getActiveQuests(now).map(q => q.type));
    const inactive = QUEST_POOL.map(q => q.type).find(type => !activeTypes.has(type));
    if (!inactive) return;
    recordQuestEvent(inactive, 1, now);
    expect(Object.keys(getQuestProgress(now))).toHaveLength(0);
  });
});
