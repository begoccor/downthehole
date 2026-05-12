import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';

export default function Nav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toggleLang, t } = useLanguage();

  const links = [
    { to: '/how-it-works', label: t('nav_how') },
    { to: '/rabbit-holes', label: t('nav_holes') },
  ];

  return (
    <nav className="nav-bar flex items-center justify-between px-5 py-3 sticky top-0 z-40 backdrop-blur">
      <Link to="/" className="font-display text-2xl text-fg tracking-tight select-none">
        ⬇ Down The Hole
      </Link>
      <div className="flex gap-2 items-center">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`font-body font-bold text-sm px-4 py-2 rounded-xl border-2 transition-all btn-press
              ${pathname === to
                ? 'bg-[#E8432D] text-white border-[#E8432D] shadow-[3px_3px_0_#111]'
                : 'nav-inactive'
              }`}
          >
            {label}
          </Link>
        ))}

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="font-body font-bold text-sm px-3 py-2 rounded-xl border-2 border-[var(--nav-inactive-border)] nav-inactive btn-press"
          aria-label="Switch language"
        >
          {t('nav_lang')}
        </button>

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
  );
}
