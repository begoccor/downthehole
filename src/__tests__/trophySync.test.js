import { describe, it, expect } from 'vitest';

// Pure trophy merge logic extracted for testing
function mergeTrophies(localIds, dbTrophies, today) {
  const existingIds = new Set(dbTrophies.map(t => t.id));
  return [
    ...dbTrophies,
    ...[...localIds]
      .filter(id => !existingIds.has(id))
      .map(id => ({ id, earned_at: today })),
  ];
}

describe('mergeTrophies', () => {
  const TODAY = '2026-05-30';

  it('adds local-only trophies to DB list', () => {
    const result = mergeTrophies(
      new Set(['first_dive', 'streak_3']),
      [],
      TODAY
    );
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(['first_dive', 'streak_3']);
    expect(result[0].earned_at).toBe(TODAY);
  });

  it('preserves existing DB earned_at dates', () => {
    const dbTrophies = [{ id: 'first_dive', earned_at: '2026-01-01' }];
    const result = mergeTrophies(
      new Set(['first_dive', 'streak_3']),
      dbTrophies,
      TODAY
    );
    expect(result).toHaveLength(2);
    const existing = result.find(t => t.id === 'first_dive');
    expect(existing.earned_at).toBe('2026-01-01'); // original date preserved
    const newOne = result.find(t => t.id === 'streak_3');
    expect(newOne.earned_at).toBe(TODAY);
  });

  it('does not duplicate trophies already in DB', () => {
    const dbTrophies = [
      { id: 'first_dive', earned_at: '2026-01-01' },
      { id: 'streak_3',   earned_at: '2026-01-05' },
    ];
    const result = mergeTrophies(
      new Set(['first_dive', 'streak_3']),
      dbTrophies,
      TODAY
    );
    expect(result).toHaveLength(2);
  });

  it('returns DB trophies unchanged when local set is empty', () => {
    const dbTrophies = [{ id: 'first_dive', earned_at: '2026-01-01' }];
    const result = mergeTrophies(new Set(), dbTrophies, TODAY);
    expect(result).toEqual(dbTrophies);
  });

  it('returns empty array when both are empty', () => {
    expect(mergeTrophies(new Set(), [], TODAY)).toEqual([]);
  });
});

// Profile stat preference logic (DB over local when signed in)
function resolveStats(dbProfile, localStreak) {
  if (!dbProfile) return localStreak;
  return {
    current: dbProfile.daily_streak   ?? localStreak.current,
    longest: dbProfile.longest_streak ?? localStreak.longest,
    deepest: dbProfile.deepest_dive   ?? localStreak.deepest,
    total:   dbProfile.total_dives    ?? localStreak.total,
  };
}

describe('resolveStats', () => {
  const local = { current: 3, longest: 7, deepest: 12, total: 20 };

  it('returns local stats when no DB profile', () => {
    expect(resolveStats(null, local)).toBe(local);
  });

  it('prefers DB values when present', () => {
    const db = { daily_streak: 5, longest_streak: 10, deepest_dive: 15, total_dives: 30 };
    const result = resolveStats(db, local);
    expect(result.current).toBe(5);
    expect(result.longest).toBe(10);
    expect(result.deepest).toBe(15);
    expect(result.total).toBe(30);
  });

  it('falls back to local when DB fields are null', () => {
    const db = { daily_streak: null, longest_streak: null, deepest_dive: null, total_dives: null };
    const result = resolveStats(db, local);
    expect(result.current).toBe(local.current);
    expect(result.total).toBe(local.total);
  });
});
