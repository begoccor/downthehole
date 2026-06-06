import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useLeaderboard() {
  const { user } = useAuth();

  const syncStats = useCallback(async (dailyStreak, totalDives) => {
    if (!user) return;
    try {
      const { data: current } = await supabase
        .from('leaderboard')
        .select('daily_streak, total_dives')
        .eq('user_id', user.id)
        .single();
      await supabase
        .from('leaderboard')
        .update({
          daily_streak: Math.max(dailyStreak, current?.daily_streak ?? 0),
          total_dives:  Math.max(totalDives,  current?.total_dives  ?? 0),
          updated_at:   new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } catch {}
  }, [user]);

  // Sync full profile stats — takes the max of local vs DB to avoid overwriting
  // data from another device.
  const syncFullStats = useCallback(async (streak) => {
    if (!user) return;
    try {
      const { data: current } = await supabase
        .from('leaderboard')
        .select('daily_streak, longest_streak, deepest_dive, total_dives')
        .eq('user_id', user.id)
        .single();
      await supabase
        .from('leaderboard')
        .update({
          daily_streak:   Math.max(streak.current, current?.daily_streak   ?? 0),
          longest_streak: Math.max(streak.longest, current?.longest_streak ?? 0),
          deepest_dive:   Math.max(streak.deepest, current?.deepest_dive   ?? 0),
          total_dives:    Math.max(streak.total,   current?.total_dives    ?? 0),
          updated_at:     new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } catch {}
  }, [user]);

  const recordDailyWin = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('leaderboard')
        .select('daily_wins')
        .eq('user_id', user.id)
        .single();
      const current = data?.daily_wins ?? 0;
      await supabase
        .from('leaderboard')
        .update({ daily_wins: current + 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } catch {}
  }, [user]);

  const fetchBoard = useCallback(async (orderBy = 'total_dives') => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, display_name, daily_streak, total_dives, daily_wins')
        .order(orderBy, { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    } catch {
      try {
        const safeOrder = orderBy === 'daily_wins' ? 'total_dives' : orderBy;
        const { data } = await supabase
          .from('leaderboard')
          .select('user_id, display_name, daily_streak, total_dives')
          .order(safeOrder, { ascending: false })
          .limit(50);
        return data ?? [];
      } catch {
        return [];
      }
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    try {
      const { data } = await supabase
        .from('leaderboard')
        .select('display_name, daily_streak, longest_streak, deepest_dive, total_dives, daily_wins, trophies')
        .eq('user_id', user.id)
        .single();
      return data ?? null;
    } catch {
      return null;
    }
  }, [user]);

  return { syncStats, syncFullStats, recordDailyWin, fetchBoard, fetchProfile, userId: user?.id ?? null };
}
