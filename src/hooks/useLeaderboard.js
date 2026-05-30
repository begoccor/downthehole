import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useLeaderboard() {
  const { user } = useAuth();

  const syncStats = useCallback(async (dailyStreak, totalDives) => {
    if (!user) return;
    const displayName =
      user.user_metadata?.display_name ??
      user.email?.split('@')[0] ??
      'Anonymous';
    try {
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
        );
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
      // daily_wins column may not exist yet — fall back to basic columns
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

  return { syncStats, recordDailyWin, fetchBoard, userId: user?.id ?? null };
}
