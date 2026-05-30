import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Field({ label, type = 'text', value, onChange, placeholder, maxLength }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-xs font-bold text-black/50 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        required
        className="px-4 py-3 font-body text-sm border-4 border-black rounded-2xl bg-white text-black shadow-[4px_4px_0_#111] focus:outline-none focus:ring-2 focus:ring-[#E8432D] placeholder-black/30"
      />
    </div>
  );
}

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp, user } = useAuth();
  const [tab, setTab]               = useState('signin');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  if (!showAuthModal || user) return null;

  const reset = () => {
    setError('');
    setLoading(false);
    setSuccess(false);
  };

  const switchTab = (t) => { setTab(t); reset(); };
  const close     = () => { setShowAuthModal(false); reset(); };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    close();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    const name = displayName.trim();
    if (name.length < 2) { setError('Display name must be at least 2 characters.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    const { data, error: err } = await signUp(email, password);
    if (err) { setLoading(false); setError(err.message); return; }

    // Seed leaderboard row with existing local stats
    const localStreak = (() => {
      try { return JSON.parse(localStorage.getItem('dth-streak') ?? '{}'); } catch { return {}; }
    })();
    try {
      await supabase.from('leaderboard').insert({
        user_id:      data.user.id,
        display_name: name,
        daily_streak: localStreak.current ?? 0,
        total_dives:  localStreak.total   ?? 0,
      });
    } catch {}

    setLoading(false);
    setSuccess(true);
    setTimeout(close, 1200);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
  };

  const headerTitle = tab === 'signin' ? 'Sign in' : tab === 'signup' ? 'Create account' : 'Reset password';

  return (
    <AnimatePresence>
      <motion.div
        key="auth-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        style={{ background: 'rgba(13,7,33,0.72)', backdropFilter: 'blur(4px)' }}
        onClick={e => { if (e.target === e.currentTarget) close(); }}
      >
        <motion.div
          key="auth-card"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
          className="w-full max-w-sm card shadow-[8px_8px_0_#111] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0D0721] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-white">{headerTitle}</h2>
            <button onClick={close} className="font-body text-xl text-white/50 hover:text-white transition-colors leading-none" aria-label="Close">✕</button>
          </div>

          {/* Tabs — hidden on reset screen */}
          {tab !== 'reset' && (
            <div className="flex border-b-4 border-black">
              {['signin', 'signup'].map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2.5 font-body text-sm font-bold transition-colors ${
                    tab === t ? 'bg-white text-black' : 'bg-black/5 text-black/50 hover:text-black'
                  }`}
                >
                  {t === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-4"
              >
                {tab === 'reset' ? (
                  <>
                    <p className="text-4xl mb-2">📬</p>
                    <p className="font-display text-2xl text-[#E8432D]">Check your email</p>
                    <p className="font-body text-sm text-black/50 mt-1">We sent a reset link to {email}.</p>
                    <button
                      onClick={() => switchTab('signin')}
                      className="mt-4 font-body text-sm text-[#E8432D] underline font-bold"
                    >
                      Back to sign in
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-4xl mb-2">🐰</p>
                    <p className="font-display text-2xl text-[#E8432D]">You're in!</p>
                    <p className="font-body text-sm text-black/50 mt-1">Welcome to the leaderboard.</p>
                  </>
                )}
              </motion.div>
            ) : tab === 'reset' ? (
              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                {error && (
                  <p className="font-body text-xs text-[#E8432D] font-bold -mt-1">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#E8432D] text-white font-display text-xl border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press disabled:opacity-50"
                >
                  {loading ? '…' : 'Send reset link'}
                </button>
                <p className="font-body text-xs text-black/40 text-center">
                  <button type="button" onClick={() => switchTab('signin')} className="text-[#E8432D] underline font-bold">
                    Back to sign in
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
                {tab === 'signup' && (
                  <Field
                    label="Display name"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="How you'll appear on the board"
                    maxLength={30}
                  />
                )}
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

                {error && (
                  <p className="font-body text-xs text-[#E8432D] font-bold -mt-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#E8432D] text-white font-display text-xl border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press disabled:opacity-50"
                >
                  {loading ? '…' : tab === 'signin' ? 'Sign in' : 'Create account'}
                </button>

                <p className="font-body text-xs text-black/40 text-center">
                  {tab === 'signin' ? "No account? " : "Already have one? "}
                  <button type="button" onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
                    className="text-[#E8432D] underline font-bold"
                  >
                    {tab === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
                {tab === 'signin' && (
                  <p className="font-body text-xs text-black/40 text-center -mt-2">
                    <button type="button" onClick={() => switchTab('reset')} className="underline hover:text-black/60 transition-colors">
                      Forgot password?
                    </button>
                  </p>
                )}
                {tab === 'signup' && (
                  <p className="font-body text-xs text-black/30 text-center -mt-1">
                    By signing up you agree to our{' '}
                    <Link to="/terms" onClick={close} className="underline hover:text-black/50 transition-colors">
                      Terms
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" onClick={close} className="underline hover:text-black/50 transition-colors">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
