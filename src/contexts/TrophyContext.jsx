import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TROPHIES } from '../data/trophies';

const Ctx = createContext(null);
export const useTrophies = () => useContext(Ctx);

const KEY = 'dth-trophies';
function load() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY)) ?? []); }
  catch { return new Set(); }
}

export function TrophyProvider({ children }) {
  const [earned, setEarned]       = useState(load);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast]         = useState(null);

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

  useEffect(() => {
    if (!pendingId) return;
    const def = TROPHIES.find(t => t.id === pendingId);
    setToast(def ?? null);
    setPendingId(null);
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [pendingId]);

  const clearToast = useCallback(() => setToast(null), []);
  const hasTrophy  = useCallback((id) => earned.has(id), [earned]);

  return (
    <Ctx.Provider value={{ earned, awardTrophy, hasTrophy, toast, clearToast }}>
      {children}
    </Ctx.Provider>
  );
}
