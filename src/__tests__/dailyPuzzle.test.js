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
vi.stubGlobal('window', { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} });
if (typeof globalThis.CustomEvent === 'undefined') {
  vi.stubGlobal('CustomEvent', class { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } });
}

const { PUZZLES, getHoleNumber, getDailyPuzzle, hasWonToday, getTodayResult, recordDailyResult, getTotalDailyWins } =
  await import('../data/dailyPuzzle.js');

describe('PUZZLES sanity', () => {
  it('every puzzle is fully trilingual with a par', () => {
    for (const p of PUZZLES) {
      for (const lang of ['en', 'fr', 'es']) {
        expect(typeof p.start[lang]).toBe('string');
        expect(p.start[lang].length).toBeGreaterThan(0);
        expect(typeof p.target.label[lang]).toBe('string');
        expect(p.target.test[lang]).toBeInstanceOf(RegExp);
      }
      expect(p.par).toBeGreaterThanOrEqual(1);
    }
  });

  it('has a healthy rotation length', () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(30);
  });
});

describe('getHoleNumber', () => {
  it('is 1 on the epoch day', () => {
    expect(getHoleNumber(new Date('2026-01-01T12:00:00'))).toBe(1);
  });

  it('increments by one per local day', () => {
    const a = getHoleNumber(new Date('2026-06-10T00:01:00'));
    const b = getHoleNumber(new Date('2026-06-11T23:59:00'));
    expect(b - a).toBe(1);
  });

  it('is stable across the same day', () => {
    expect(getHoleNumber(new Date('2026-06-10T00:01:00')))
      .toBe(getHoleNumber(new Date('2026-06-10T23:59:00')));
  });
});

describe('getDailyPuzzle', () => {
  const now = new Date('2026-06-10T10:00:00');

  it('returns the same puzzle index for every language', () => {
    const en = getDailyPuzzle('en', now);
    const fr = getDailyPuzzle('fr', now);
    const es = getDailyPuzzle('es', now);
    expect(en.hole).toBe(fr.hole);
    const expected = PUZZLES[en.hole % PUZZLES.length];
    expect(en.start).toBe(expected.start.en);
    expect(fr.start).toBe(expected.start.fr);
    expect(es.start).toBe(expected.start.es);
    expect(en.par).toBe(fr.par);
  });

  it('resolves a usable target test', () => {
    const p = getDailyPuzzle('en', now);
    expect(p.target.test).toBeInstanceOf(RegExp);
    expect(typeof p.target.label).toBe('string');
  });

  it('falls back to English for unknown languages', () => {
    const p = getDailyPuzzle('de', now);
    expect(p.start).toBe(PUZZLES[p.hole % PUZZLES.length].start.en);
  });
});

describe('daily result persistence', () => {
  beforeEach(() => store.clear());

  it('hasWonToday is false initially', () => {
    expect(hasWonToday()).toBe(false);
    expect(getTodayResult()).toBeNull();
  });

  it('recordDailyResult marks today as won with the hop count', () => {
    recordDailyResult(5);
    expect(hasWonToday()).toBe(true);
    expect(getTodayResult().hops).toBe(5);
    expect(getTotalDailyWins()).toBe(1);
  });

  it('recording twice the same day does not double-count wins', () => {
    recordDailyResult(5);
    recordDailyResult(4);
    expect(getTotalDailyWins()).toBe(1);
  });

  it('a stale result from another day does not count as won today', () => {
    recordDailyResult(5);
    const raw = JSON.parse(store.get('dth-daily-result'));
    raw.date = '2020-01-01';
    store.set('dth-daily-result', JSON.stringify(raw));
    expect(hasWonToday()).toBe(false);
    expect(getTotalDailyWins()).toBe(1); // total survives
  });

  it('supports the legacy dth-daily-win key', () => {
    const today = new Date().toISOString().slice(0, 10);
    store.set('dth-daily-win', today);
    expect(hasWonToday()).toBe(true);
    expect(getTodayResult().hops).toBeNull();
  });
});
