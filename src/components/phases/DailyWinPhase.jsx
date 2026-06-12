import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDailyStats, percentileBeaten } from '../../hooks/useDailyStats';
import { buildShareGrid, buildShareText } from '../../data/shareGrid';
import SocialShare from '../SocialShare';
import InviteFriends from '../InviteFriends';
import NextHoleCountdown from '../NextHoleCountdown';
import DailyHistogram from '../DailyHistogram';

const WIN_PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left:     `${(i * 47 + 11) % 100}%`,
  top:      `${(i * 61 + 5) % 100}%`,
  duration: 1.8 + (i % 4) * 0.6,
  delay:    (i * 0.21) % 2.8,
  emoji:    ['✦', '⭐', '✨', '🌟'][i % 4],
  size:     `${0.7 + (i % 3) * 0.45}rem`,
}));

export default function DailyWinPhase({ puzzle, chain, onContinue }) {
  const { t }  = useLanguage();
  const { user, openAuthModal } = useAuth();
  const { fetchDistribution } = useDailyStats();
  const [copied, setCopied] = useState(false);
  const [stats, setStats]   = useState(null);

  const hops = chain.length - 1;
  const startTopic = chain[0];
  const over = hops - puzzle.par;

  useEffect(() => {
    let alive = true;
    // Small delay so freshly submitted results are included
    const id = setTimeout(() => {
      fetchDistribution().then(d => { if (alive && d) setStats(d); });
    }, 800);
    return () => { alive = false; clearTimeout(id); };
  }, [fetchDistribution]);

  const pct = stats ? percentileBeaten(stats.distribution, hops) : null;

  const copyResult = () => {
    const text = buildShareText({
      hole: puzzle.hole, start: startTopic, hops, par: puzzle.par,
      hopWord: hops === 1 ? t('hop') : t('hops'),
    });
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const parLine = over < 0 ? t('daily_under_par', { d: -over })
    : over === 0 ? t('daily_on_par')
    : t('daily_over_par', { d: over });

  return (
    <motion.div
      key="daily_win"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto px-6 py-10"
      style={{ background: 'linear-gradient(160deg, #0D0721 0%, #0A1800 45%, #0D0721 100%)' }}
    >
      {/* Gold particles */}
      {WIN_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{ left: p.left, top: p.top, fontSize: p.size, color: '#F7C948' }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4], rotate: [0, 180, 360] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        >
          {p.emoji}
        </motion.span>
      ))}

      <div className="z-10 w-full max-w-md mx-auto flex flex-col items-center gap-4 my-auto">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.65, delay: 0.05 }}
          className="text-[4.5rem] leading-none"
        >
          🏆
        </motion.div>

        {/* Heading + sub */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="font-display text-[clamp(1.8rem,7vw,3rem)] text-[#F7C948] leading-tight mb-1">
            {t('daily_win_title', { hole: puzzle.hole })}
          </h1>
          <p className="font-body text-sm text-white/60">
            {t('daily_goal_sub', { topic: chain[chain.length - 1], n: hops, start: startTopic })}
          </p>
        </motion.div>

        {/* Score card: hops vs par + share grid */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
          className="w-full rounded-2xl border-2 p-4 text-center"
          style={{ background: 'rgba(247,201,72,0.06)', borderColor: 'rgba(247,201,72,0.25)' }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F7C948] border-4 border-black rounded-full shadow-[3px_3px_0_#111]">
              <span className="font-display text-2xl text-black">{hops}</span>
              <span className="font-body text-xs font-bold text-black/70">{hops === 1 ? t('hop') : t('hops')}</span>
            </span>
            <span className="font-body text-sm text-white/50">{t('daily_par')} {puzzle.par}</span>
          </div>
          <p className="font-body text-sm font-bold mb-3" style={{ color: over <= 0 ? '#9CCC65' : 'rgba(255,255,255,0.7)' }}>
            {parLine}
          </p>
          <p className="text-xl tracking-wide mb-3 select-all" aria-label="result grid">
            {buildShareGrid(hops)}
          </p>
          <button
            onClick={copyResult}
            className="w-full py-3 bg-[#F7C948] text-black font-display text-lg border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
          >
            {copied ? t('share_copied') : t('copy_result')}
          </button>
        </motion.div>

        {/* Global stats — only when the backend answered */}
        {stats && stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl border-2 p-4"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            {pct != null && (
              <p className="font-display text-lg text-white text-center mb-1">
                {t('pct_better', { pct })}
              </p>
            )}
            <p className="font-body text-[10px] uppercase tracking-widest text-center mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('solvers_today', { n: stats.total })}
            </p>
            <DailyHistogram distribution={stats.distribution} myHops={hops} />
          </motion.div>
        )}

        {/* Sign-in nudge */}
        {!user && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            onClick={openAuthModal}
            className="font-body text-sm underline"
            style={{ color: 'rgba(247,201,72,0.65)' }}
          >
            {t('daily_goal_nudge')}
          </motion.button>
        )}

        {/* Share + countdown + continue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="w-full flex flex-col items-center gap-3"
        >
          <p className="font-body text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('daily_goal_share')}
          </p>
          <SocialShare chain={chain} startTopic={startTopic} isDailyWin={true} />
          <InviteFriends chain={chain} dark />
          <NextHoleCountdown className="text-white/50" />
          <button
            onClick={onContinue}
            className="font-body text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {t('daily_goal_continue')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
