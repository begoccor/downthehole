import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/deviceId';
import { useAuth } from '../contexts/AuthContext';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Global daily-puzzle results: anonymous (device-id) submissions plus an
// optional user_id when signed in. Everything fails silently — the daily is
// fully playable without a backend.
export function useDailyStats() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Plain insert, not upsert: ON CONFLICT needs a SELECT policy under RLS and
  // raw rows are intentionally unreadable. The (day, device_id) unique
  // constraint rejects duplicate submissions; that error is ignored.
  const submitDailyResult = useCallback(async (hops) => {
    try {
      await supabase
        .from('daily_results')
        .insert({ day: todayStr(), device_id: getDeviceId(), user_id: userId, hops });
    } catch { /* offline / unconfigured */ }
  }, [userId]);

  // Returns { total, distribution: [{ hops, n }] } or null when unavailable.
  const fetchDistribution = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('daily_distribution', { p_day: todayStr() });
      if (error || !Array.isArray(data) || data.length === 0) return null;
      const distribution = data.map(r => ({ hops: r.hops, n: Number(r.n) }));
      const total = distribution.reduce((sum, r) => sum + r.n, 0);
      return { total, distribution };
    } catch {
      return null;
    }
  }, []);

  return { submitDailyResult, fetchDistribution };
}

// "Better than X%" — the share of recorded results that took more hops.
export function percentileBeaten(distribution, myHops) {
  const total = distribution.reduce((sum, r) => sum + r.n, 0);
  if (total === 0) return null;
  const worse = distribution.filter(r => r.hops > myHops).reduce((sum, r) => sum + r.n, 0);
  return Math.round((worse / total) * 100);
}
