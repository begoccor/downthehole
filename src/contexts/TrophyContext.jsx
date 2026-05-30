import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TROPHIES } from '../data/trophies';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);
export const useTrophies = () => useContext(Ctx);

const KEY = 'dth-trophies';

function loadLocal() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY)) ?? []); }
  catch { return new Set(); }
}

export function TrophyProvider({ children }) {
  const { user } = useAuth();
  const [earned, setEarned]       = useState(loadLocal);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast]         = useState(null);

  // Bidirectional trophy sync on sign-in:
  //  - pull DB trophies into local state
  //  - push any local-only trophies back to DB
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('leaderboard')
          .select('trophies')
          .eq('user_id', user.id)
          .single();

        const dbTrophies = data?.trophies ?? [];
        const dbIds = new Set(dbTrophies.map(t => t.id));
        const local = loadLocal();

        // Merge DB into local
        const merged = new Set([...local, ...dbIds]);
        localStorage.setItem(KEY, JSON.stringify([...merged]));
        setEarned(merged);

        // Push local-only trophies back to DB
        const today = new Date().toISOString().slice(0, 10);
        const localOnly = [...local].filter(id => !dbIds.has(id));
        if (localOnly.length > 0) {
          const updated = [
            ...dbTrophies,
            ...localOnly.map(id => ({ id, earned_at: today })),
          ];
          await supabase
            .from('leaderboard')
            .update({ trophies: updated, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }
      } catch {}
    })();
  }, [user?.id]);

  const awardTrophy = useCallback((id) => {
    setEarned(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      setPendingId(id);
      return next;
    });
  }, []);

  // Sync a newly earned trophy to DB
  useEffect(() => {
    if (!pendingId || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('leaderboard')
      .select('trophies')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const existing = data?.trophies ?? [];
        if (existing.some(t => t.id === pendingId)) return;
        const updated = [...existing, { id: pendingId, earned_at: today }];
        return supabase
          .from('leaderboard')
          .update({ trophies: updated, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      })
      .catch(() => {});
  }, [pendingId, user?.id]);

  useEffect(() => {
    if (!pendingId) return;
    const def = TROPHIES.find(t => t.id === pendingId);
    setToast(def ?? null);
    setPendingId(null);
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [pendingId]);

  const clearToast  = useCallback(() => setToast(null), []);
  const hasTrophy   = useCallback((id) => earned.has(id), [earned]);

  // Expose earned dates from DB for display
  const [earnedDates, setEarnedDates] = useState({});
  useEffect(() => {
    if (!user) return;
    supabase
      .from('leaderboard')
      .select('trophies')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.trophies) return;
        const map = {};
        data.trophies.forEach(t => { map[t.id] = t.earned_at; });
        setEarnedDates(map);
      })
      .catch(() => {});
  }, [user?.id, earned.size]);

  return (
    <Ctx.Provider value={{ earned, earnedDates, awardTrophy, hasTrophy, toast, clearToast }}>
      {children}
    </Ctx.Provider>
  );
}
