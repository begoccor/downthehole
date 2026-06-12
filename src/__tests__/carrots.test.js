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

const { getCarrots, earnCarrots, spendCarrots } = await import('../data/carrots.js');

describe('carrot wallet', () => {
  beforeEach(() => {
    store.clear();
    dispatched.length = 0;
  });

  it('starts at zero', () => {
    expect(getCarrots()).toBe(0);
  });

  it('earns and accumulates', () => {
    earnCarrots(10);
    earnCarrots(5);
    expect(getCarrots()).toBe(15);
  });

  it('announces a reward toast only when a reason is given', () => {
    earnCarrots(10);
    expect(dispatched.filter(e => e.type === 'dth-reward')).toHaveLength(0);
    earnCarrots(5, 'reward_daily');
    expect(dispatched.filter(e => e.type === 'dth-reward')).toHaveLength(1);
  });

  it('spends within balance', () => {
    earnCarrots(30);
    expect(spendCarrots(25)).toBe(true);
    expect(getCarrots()).toBe(5);
  });

  it('refuses to overspend', () => {
    earnCarrots(10);
    expect(spendCarrots(11)).toBe(false);
    expect(getCarrots()).toBe(10);
  });

  it('survives corrupted storage', () => {
    store.set('dth-carrots', 'garbage');
    expect(getCarrots()).toBe(0);
  });
});
