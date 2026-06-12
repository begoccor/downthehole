import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

// Slim persistent banner shown during a daily-puzzle session.
export default function DailyBanner({ puzzle, hops, dark = false }) {
  const { t } = useLanguage();
  if (!puzzle) return null;

  const over = hops - puzzle.par;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-body text-xs font-bold"
      style={dark
        ? { background: 'rgba(247,201,72,0.12)', borderColor: 'rgba(247,201,72,0.4)', color: '#F7C948' }
        : { background: 'rgba(247,201,72,0.14)', borderColor: 'rgba(247,201,72,0.55)', color: 'var(--fg)' }}
    >
      <span>🎯 {t('daily_goal_label')} <strong>{puzzle.target.label}</strong></span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span className="tabular-nums">{hops} {hops === 1 ? t('hop') : t('hops')}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span className="tabular-nums" style={{ opacity: over > 0 ? 0.8 : 1 }}>
        {t('daily_par')} {puzzle.par}
      </span>
    </motion.div>
  );
}
