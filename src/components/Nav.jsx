import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';
import OArrow from './OArrow';

const TABS = [
  { to: '/',             icon: '🕳️', key: 'nav_home'  },
  { to: '/how-it-works', icon: '💡', key: 'nav_how'   },
  { to: '/rabbit-holes', icon: '🐰', key: 'nav_holes' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const desktopLinks = [
    { to: '/how-it-works', label: t('nav_how') },
    { to: '/rabbit-holes', label: t('nav_holes') },
  ];

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <nav className="nav-bar flex items-center justify-between px-4 py-3 sticky top-0 z-40 backdrop-blur">
        <Link
          to="/"
          onClick={() => window.dispatchEvent(new CustomEvent('dth-go-home'))}
          className="font-display text-2xl text-fg tracking-tight select-none"
        >
          followtheh<OArrow />le.com
        </Link>

        <div className="flex gap-2 items-center">
          {/* Desktop nav links */}
          {desktopLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`hidden md:inline-flex font-body font-bold text-sm px-4 py-2 rounded-xl border-2 transition-all btn-press
                ${pathname === to
                  ? 'bg-[#E8432D] text-white border-[#E8432D] shadow-[3px_3px_0_#111]'
                  : 'nav-inactive'
                }`}
            >
              {label}
            </Link>
          ))}

          {/* Language selector */}
          <div className="relative">
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="font-body font-bold text-sm pl-3 pr-6 py-2 rounded-xl border-2 border-[var(--nav-inactive-border)] nav-inactive bg-transparent cursor-pointer appearance-none"
              aria-label="Select language"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-60" aria-hidden>▾</span>
          </div>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/followthehole?igsh=MWdoNHQ4YXZhaGFwNg%3D%3D&utm_source=qr"
            target="_blank" rel="noreferrer"
            aria-label="Follow on Instagram"
            className="w-9 h-9 rounded-xl border-2 border-[var(--nav-inactive-border)] nav-inactive flex items-center justify-center btn-press overflow-hidden"
            style={{ padding: 0 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f09433"/>
                  <stop offset="50%" stopColor="#dc2743"/>
                  <stop offset="100%" stopColor="#bc1888"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1" fill="url(#ig-grad)"/>
            </svg>
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? t('nav_light') : t('nav_dark')}
            className="w-9 h-9 rounded-xl border-2 border-[var(--nav-inactive-border)] nav-inactive flex items-center justify-center text-base btn-press"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 nav-bar border-t border-[var(--nav-border)] flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(({ to, icon, key }) => {
          const active = pathname === to || (to === '/' && pathname === '/');
          return (
            <Link
              key={to}
              to={to}
              onClick={to === '/' ? () => window.dispatchEvent(new CustomEvent('dth-go-home')) : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? 'text-[#E8432D]' : 'text-fg-muted'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="font-body text-[10px] font-semibold leading-none">
                {t(key).replace(/^🐰\s*/, '')}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
