import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback((email, password) =>
    supabase.auth.signUp({ email, password }), []);

  const signIn = useCallback((email, password) =>
    supabase.auth.signInWithPassword({ email, password }), []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);

  return (
    <Ctx.Provider value={{ user, loading, signUp, signIn, signOut, showAuthModal, setShowAuthModal, openAuthModal }}>
      {children}
    </Ctx.Provider>
  );
}
