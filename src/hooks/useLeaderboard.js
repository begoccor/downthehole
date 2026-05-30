import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useLeaderboard() {
  const { user } = useAuth();

  // Call after each session to keep the board up-to-date.
  // Uses upsert so a missing row (e.g. failed signup seed) is created automatically.
  const syncStats = useCallback(async (dailyStreak, totalDives) => {
    if (!user) return;
    const displayName =
      user.user_metadata?.display_name ??
      user.email?.split('@')[0] ??
      'Anonymous';
    await supabase
      .from('leaderboard')
      .upsert(
        {
          user_id:      user.id,
          display_name: displayName,
          daily_streak: dailyStreak,
          total_dives:  totalDives,
          updated_at:   new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .catch(() => {});
  }, [user]);

  // Increment daily_wins by 1 — call once when user reaches the daily goal
  const recordDailyWin = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('leaderboard')
      .select('daily_wins')
      .eq('user_id', user.id)
      .single()
      .catch(() => ({ data: null }));
    const current = data?.daily_wins ?? 0;
    await supabase
      .from('leaderboard')
      .update({ daily_wins: current + 1, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .catch(() => {});
  }, [user]);

  // Fetch top 50 for a given column
  const fetchBoard = useCallback(async (orderBy = 'total_dives') => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('user_id, display_name, daily_streak, total_dives, daily_wins')
      .order(orderBy, { ascending: false })
      .limit(50);
    if (error) {
      // daily_wins column may not exist yet — fall back to basic columns
      const safeOrder = orderBy === 'daily_wins' ? 'total_dives' : orderBy;
      const { data: fallback } = await supabase
        .from('leaderboard')
        .select('user_id, display_name, daily_streak, total_dives')
        .order(safeOrder, { ascending: false })
        .limit(50);
      return fallback ?? [];
    }
    return data ?? [];
  }, []);

  return { syncStats, recordDailyWin, fetchBoard, userId: user?.id ?? null };
}
