import { useState, useCallback } from 'react';

const KEY = 'dth-streak';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {
      lastDiveDate: null, current: 0, longest: 0, deepest: 0, total: 0,
    };
  } catch {
    return { lastDiveDate: null, current: 0, longest: 0, deepest: 0, total: 0 };
  }
}

export function getDepthBadge(n) {
  if (n >= 10) return { emoji: '🌌', key: 'badge_void' };
  if (n >= 7)  return { emoji: '🌀', key: 'badge_spiraler' };
  if (n >= 5)  return { emoji: '🐰', key: 'badge_rabbit' };
  if (n >= 3)  return { emoji: '🕳️', key: 'badge_hopper' };
  return { emoji: '🐾', key: 'badge_toe' };
}

export function getStreakBadge(days) {
  if (days >= 30) return { emoji: '💎', key: 'sbadge_chronic' };
  if (days >= 7)  return { emoji: '⚡', key: 'sbadge_weekly' };
  if (days >= 3)  return { emoji: '🔥', key: 'sbadge_fire' };
  return null;
}

export function useStreak() {
  const [streak, setStreak] = useState(load);

  // Call at the start of each new session (not on every hop)
  const recordDive = useCallback(() => {
    setStreak(prev => {
      const today     = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      let current = prev.current;
      if (prev.lastDiveDate !== today) {
        current = prev.lastDiveDate === yesterday ? prev.current + 1 : 1;
      }

      const next = {
        ...prev,
        lastDiveDate: today,
        current,
        longest: Math.max(prev.longest, current),
        total: prev.total + 1,
      };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Call when a session ends to update the deepest-hole record
  const recordDepth = useCallback((n) => {
    setStreak(prev => {
      if (n <= prev.deepest) return prev;
      const next = { ...prev, deepest: n };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // One-time backfill from existing history when streak data is missing
  const backfill = useCallback((total, deepest) => {
    setStreak(prev => {
      if (prev.total > 0) return prev;
      const next = { ...prev, total, deepest };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { streak, recordDive, recordDepth, backfill };
}
