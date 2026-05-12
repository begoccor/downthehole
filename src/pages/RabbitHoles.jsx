import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { useStreak, getStreakBadge } from '../hooks/useStreak';
import { useTrophies } from '../contexts/TrophyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TROPHIES, RARITY_STYLES } from '../data/trophies';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function RabbitHoles() {
  const { history, clearHistory, isLiked, likedTopics, toggleLike } = useHistory();
  const { streak, backfill } = useStreak();
  const { earned, awardTrophy } = useTrophies();
  const { t } = useLanguage();
  const streakBadge = getStreakBadge(streak.current);

  useEffect(() => {
    if (streak.total === 0 && history.length > 0) {
      const deepest = Math.max(...history.map(s => s.chain.length));
      backfill(history.length, deepest);
    }
  }, [history.length, streak.total, backfill]);

  useEffect(() => {
    if (streak.total >= 1)  awardTrophy('first_dive');
    if (streak.total >= 10) awardTrophy('total_10');
    if (streak.total >= 50) awardTrophy('total_50');
    if (streak.current >= 3)  awardTrophy('streak_3');
    if (streak.current >= 7)  awardTrophy('streak_7');
    if (streak.current >= 30) awardTrophy('streak_30');
    if (likedTopics.size >= 5) awardTrophy('starred_5');
  }, [streak.total, streak.current, likedTopics.size, awardTrophy]);

  const divesLabel = history.length === 1
    ? t('dives_one')
    : t('dives_many', { n: history.length });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[clamp(2.2rem,8vw,4rem)] text-fg leading-none">
            {t('your_holes')}
          </h1>
          <p className="font-body text-base text-fg-muted mt-1">{divesLabel}</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="font-body font-bold text-sm px-4 py-2 border-2 border-white/30 rounded-xl text-fg-muted hover:border-white hover:text-fg transition-all"
          >
            {t('clear_all')}
          </button>
        )}
      </div>

      {/* Stats panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: t('stat_streak'),
            value: `${streak.current}d`,
            sub: streakBadge ? t(streakBadge.key) : (streak.current > 0 ? t('keep_going') : t('start_today')),
          },
          { label: t('stat_best'),    value: `${streak.longest}d`, sub: t('longest_streak') },
          { label: t('stat_deepest'), value: `${streak.deepest}`,  sub: streak.deepest !== 1 ? t('hops_p') : t('hop_s') },
          { label: t('stat_total'),   value: streak.total,          sub: t('dives_p') },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card shadow-[4px_4px_0_#111] p-4 text-center">
            <p className="font-body text-[10px] text-black/50 uppercase tracking-widest mb-1">{label}</p>
            <p className="font-display text-2xl text-[#E8432D]">{value}</p>
            {sub && <p className="font-body text-xs text-black/50 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Trophies */}
      <div className="mb-8">
        <h2 className="font-display text-2xl text-fg mb-4">
          {t('trophies_title')}
          <span className="font-body text-sm text-fg-faint ml-2 font-normal">
            {earned.size} / {TROPHIES.length} {t('trophies_earned')}
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TROPHIES.map(trophy => {
            const isEarned = earned.has(trophy.id);
            const rs = RARITY_STYLES[trophy.rarity];
            return (
              <motion.div
                key={trophy.id}
                layout
                className={`card border-4 p-4 flex flex-col gap-1 transition-all duration-300
                  ${isEarned
                    ? `${rs.border} ${rs.bg} ${rs.glow}`
                    : 'border-black/10 bg-white/60 opacity-40 grayscale'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-2xl ${!isEarned ? 'opacity-30' : ''}`}>
                    {isEarned ? trophy.emoji : '🔒'}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-display text-base leading-tight ${isEarned ? rs.text : 'text-black'}`}>
                      {t(`trophy_${trophy.id}_name`)}
                    </p>
                    <p className="font-body text-[10px] text-black/40 uppercase tracking-wider">
                      {t(`rarity_${trophy.rarity}`)}
                    </p>
                  </div>
                </div>
                <p className="font-body text-xs text-black/55 leading-snug">
                  {t(`trophy_${trophy.id}_desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Starred topics */}
      {likedTopics.size > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-2xl text-fg mb-4">{t('starred_title')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {[...likedTopics].map(topic => (
                <motion.div
                  key={topic} layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card shadow-[4px_4px_0_#111] p-4 flex flex-col gap-3"
                >
                  <span className="font-display text-lg text-[#E8432D] leading-tight break-words">{topic}</span>
                  <div className="flex gap-2">
                    <Link
                      to={`/?q=${encodeURIComponent(topic)}`}
                      className="flex-1 font-body text-xs font-bold px-3 py-2 bg-[#E8432D] text-white border-2 border-black rounded-xl shadow-[2px_2px_0_#111] btn-press text-center"
                    >
                      {t('redive')}
                    </Link>
                    <button
                      onClick={() => toggleLike(topic)}
                      className="font-body text-xs px-3 py-2 border-2 border-black/20 rounded-xl text-black/45 hover:border-black hover:text-black transition-all"
                      title={t('remove_starred')}
                    >
                      ♡
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-8xl mb-4">🕳️</div>
          <p className="font-display text-3xl text-fg mb-2">{t('no_holes')}</p>
          <p className="font-body text-lg text-fg-muted mb-8">{t('no_holes_sub')}</p>
          <Link
            to="/"
            className="inline-block px-7 py-3 bg-[#E8432D] text-white font-display text-xl border-4 border-black rounded-2xl shadow-[5px_5px_0_#111] btn-press"
          >
            {t('start_diving')}
          </Link>
        </motion.div>
      )}

      {/* History list */}
      <div className="space-y-4">
        {history.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            className="card shadow-[5px_5px_0_#111] p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-display text-2xl text-[#E8432D] leading-tight flex items-center gap-2">
                {session.startTopic}
                {isLiked(session.startTopic) && (
                  <span className="text-red-500 text-xl" title={t('starred_title')}>♥</span>
                )}
              </h3>
              <span className="font-body text-xs text-black/40 shrink-0 mt-1">{fmt(session.timestamp)}</span>
            </div>
            {session.chain.length > 1 ? (
              <div className="flex flex-wrap gap-2 items-center">
                {session.chain.map((topic, j) => (
                  <span key={j} className="flex items-center gap-2">
                    <span className="font-body text-sm bg-[#F7C948] border-2 border-black rounded-full px-3 py-1 font-semibold flex items-center gap-1">
                      {topic}
                      {isLiked(topic) && <span className="text-red-500 text-xs">♥</span>}
                    </span>
                    {j < session.chain.length - 1 && (
                      <span className="text-black/30 font-bold text-lg">→</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-black/40 italic">{t('peeked_in')}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
