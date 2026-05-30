import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DAILY_GOAL, hasWonToday, markWonToday } from '../data/dailyGoal.js';

// Minimal localStorage stub for the node test environment
const store = new Map();
const localStorageMock = {
  getItem:  (k) => store.get(k) ?? null,
  setItem:  (k, v) => store.set(k, String(v)),
  removeItem:(k) => store.delete(k),
  clear:    () => store.clear(),
};
vi.stubGlobal('localStorage', localStorageMock);

// ─── DAILY_GOAL.test ─────────────────────────────────────────────────────────
describe('DAILY_GOAL.test — current objective: Philosophy', () => {
  it('matches the standalone article "Philosophy"', () => {
    expect(DAILY_GOAL.test('Philosophy')).toBe(true);
  });

  it('matches case-insensitively ("PHILOSOPHY", "philosophy")', () => {
    expect(DAILY_GOAL.test('PHILOSOPHY')).toBe(true);
    expect(DAILY_GOAL.test('philosophy')).toBe(true);
  });

  it('matches "Political philosophy" (word in middle)', () => {
    expect(DAILY_GOAL.test('Political philosophy')).toBe(true);
  });

  it('matches "Philosophy of science"', () => {
    expect(DAILY_GOAL.test('Philosophy of science')).toBe(true);
  });

  it('matches "Philosophy (disambiguation)"', () => {
    expect(DAILY_GOAL.test('Philosophy (disambiguation)')).toBe(true);
  });

  it('does NOT match "Philosopher"', () => {
    expect(DAILY_GOAL.test('Philosopher')).toBe(false);
  });

  it('does NOT match "Philosophical"', () => {
    expect(DAILY_GOAL.test('Philosophical')).toBe(false);
  });

  it('does NOT match an unrelated topic', () => {
    expect(DAILY_GOAL.test('Quantum mechanics')).toBe(false);
  });

  it('does NOT match "Philosophically"', () => {
    expect(DAILY_GOAL.test('Philosophically')).toBe(false);
  });
});

// ─── hasWonToday / markWonToday ───────────────────────────────────────────────
describe('hasWonToday / markWonToday', () => {
  const KEY = 'dth-daily-win';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('returns false when nothing is stored', () => {
    expect(hasWonToday()).toBe(false);
  });

  it('returns true after markWonToday is called', () => {
    markWonToday();
    expect(hasWonToday()).toBe(true);
  });

  it('stores today\'s ISO date string', () => {
    markWonToday();
    const today = new Date().toISOString().slice(0, 10);
    expect(localStorage.getItem(KEY)).toBe(today);
  });

  it('returns false when the stored date is yesterday', () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    localStorage.setItem(KEY, yesterday);
    expect(hasWonToday()).toBe(false);
  });

  it('calling markWonToday twice still returns true (idempotent)', () => {
    markWonToday();
    markWonToday();
    expect(hasWonToday()).toBe(true);
  });
});
