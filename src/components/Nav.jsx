import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import OArrow from './OArrow';

const TABS = [
  { to: '/',             icon: '🕳️', key: 'nav_home',  label: null },
  { to: '/how-it-works', icon: '💡', key: 'nav_how',   label: 'How-to' },
  { to: '/rabbit-holes', icon: '🐰', key: 'nav_holes', label: null },
  { to: '/leaderboard',  icon: '🏆', key: 'nav_board', label: null },
];

const LANGS = ['en', 'fr', 'es'];

function Divider() {
  return <span className="w-px h-4 shrink-0" style={{ background: 'var(--nav-inactive-border)' }} />;
}

export default function Nav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user, signOut, openAuthModal } = useAuth();

  const navLinks = [
    { to: '/rabbit-holes', label: t('nav_holes') },
    { to: '/leaderboard',  label: '🏆 ' + t('nav_board') },
  ];

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <nav className="nav-bar sticky top-0 z-40 backdrop-blur border-b"
        style={{ borderColor: 'var(--nav-border)' }}>
        <div className="flex items-center justify-between px-4 h-14 max-w-screen-xl mx-auto">

          {/* ── Logo ── */}
          <Link
            to="/"
            onClick={() => window.dispatchEvent(new CustomEvent('dth-go-home'))}
            className="font-display text-xl md:text-2xl text-fg tracking-tight select-none shrink-0"
          >
            followtheh<OArrow />le.com
          </Link>

          {/* ── Desktop: primary nav links (centre-left) ── */}
          <div className="hidden md:flex items-center gap-0.5 ml-6 mr-auto">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-body font-bold text-sm px-3.5 py-1.5 rounded-lg transition-all btn-press ${
                  pathname === to
                    ? 'bg-[#E8432D] text-white shadow-[2px_2px_0_#111]'
                    : 'text-fg-muted hover:text-fg hover:bg-black/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-2">

            {/* How it works + Social — desktop only, ghost style */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/how-it-works"
                className={`font-body text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                  pathname === '/how-it-works'
                    ? 'text-fg font-bold'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {t('nav_how')}
              </Link>
              <a
                href="https://x.com/Follow_thehole"
                target="_blank" rel="noreferrer"
                aria-label="Follow on X"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-muted hover:text-fg transition-colors hover:bg-black/5"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/followthehole?igsh=MWdoNHQ4YXZhaGFwNg%3D%3D&utm_source=qr"
                target="_blank" rel="noreferrer"
                aria-label="Follow on Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-muted hover:text-fg transition-colors hover:bg-black/5"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                  <defs>
                    <linearGradient id="ig-nav" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#f09433"/>
                      <stop offset="50%" stopColor="#dc2743"/>
                      <stop offset="100%" stopColor="#bc1888"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-nav)" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4.5" stroke="url(#ig-nav)" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="url(#ig-nav)"/>
                </svg>
              </a>
            </div>

            <Divider />

            {/* Language picklist */}
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              aria-label="Language"
              className="font-body font-bold text-[11px] tracking-widest h-9 px-2 rounded-xl border-2 border-[var(--nav-inactive-border)] nav-inactive appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
            >
              {LANGS.map(l => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('nav_light') : t('nav_dark')}
              className="w-9 h-9 rounded-xl border-2 border-[var(--nav-inactive-border)] nav-inactive flex items-center justify-center text-base btn-press"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <Divider />

            {/* Auth — most prominent element, rightmost */}
            {user ? (
              <div className="relative group">
                <button
                  className="w-9 h-9 rounded-xl border-2 border-[#E8432D] bg-[#E8432D] text-white font-display text-sm flex items-center justify-center shadow-[2px_2px_0_#111] btn-press"
                  title={user.email}
                  aria-label="Account"
                >
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </button>
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#111] overflow-hidden z-50 min-w-max">
                  <p className="font-body text-xs text-black/50 px-3 py-2 border-b border-black/10 truncate max-w-[200px]">{user.email}</p>
                  <button
                    onClick={signOut}
                    className="font-body text-sm text-[#E8432D] px-3 py-2 hover:bg-red-50 text-left transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="font-body font-bold text-sm px-4 py-2 rounded-xl bg-[#E8432D] text-white border-2 border-[#E8432D] shadow-[3px_3px_0_#111] btn-press transition-all hover:shadow-[1px_1px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 nav-bar border-t"
        style={{ borderColor: 'var(--nav-border)', transform: 'translateZ(0)', willChange: 'transform' }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'row', paddingTop: 6, paddingBottom: 'calc(env(safe-area-inset-bottom) + 6px)' }}
        >
          {TABS.map(({ to, icon, key, label }) => {
            const active = pathname === to;
            const displayLabel = label ?? t(key).replace(/^🐰\s*/, '');
            return (
              <Link
                key={to}
                to={to}
                onClick={to === '/' ? () => window.dispatchEvent(new CustomEvent('dth-go-home')) : undefined}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative', textDecoration: 'none' }}
              >
                {active && (
                  <span style={{ position: 'absolute', inset: '4px 6px', borderRadius: 10, background: 'var(--yellow)', opacity: 0.15 }} />
                )}
                <span style={{ fontSize: 20, lineHeight: 1, transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s' }}>
                  {icon}
                </span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, lineHeight: 1, color: active ? 'var(--yellow)' : 'var(--fg-muted)', letterSpacing: '0.03em' }}>
                  {displayLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
