import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { useStreak, getStreakBadge } from '../hooks/useStreak';
import { useTrophies } from '../contexts/TrophyContext';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useLanguage } from '../contexts/LanguageContext';
import { TROPHIES, RARITY_STYLES } from '../data/trophies';
import SocialShare from '../components/SocialShare';
import NewsletterSignup from '../components/NewsletterSignup';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function RabbitHoles() {
  const { history, clearHistory, isLiked, likedTopics, toggleLike } = useHistory();
  const { streak, backfill } = useStreak();
  const { earned, earnedDates, awardTrophy } = useTrophies();
  const { user, openAuthModal } = useAuth();
  const { fetchProfile, syncFullStats } = useLeaderboard();
  const { t } = useLanguage();
  const streakBadge = getStreakBadge(streak.current);

  const [skipAnim, setSkipAnim] = useState(
    () => localStorage.getItem('dth-skip-transition') === 'true'
  );
  const [dbProfile, setDbProfile] = useState(null);

  const toggleSkipAnim = () => {
    const next = !skipAnim;
    setSkipAnim(next);
    localStorage.setItem('dth-skip-transition', String(next));
  };

  // Backfill local streak from history if missing
  useEffect(() => {
    if (streak.total === 0 && history.length > 0) {
      const deepest = Math.max(...history.map(s => s.chain.length));
      backfill(history.length, deepest);
    }
  }, [history.length, streak.total, backfill]);

  // Award trophies based on local stats
  useEffect(() => {
    if (streak.total >= 1)  awardTrophy('first_dive');
    if (streak.total >= 10) awardTrophy('total_10');
    if (streak.total >= 50) awardTrophy('total_50');
    if (streak.current >= 3)  awardTrophy('streak_3');
    if (streak.current >= 7)  awardTrophy('streak_7');
    if (streak.current >= 30) awardTrophy('streak_30');
    if (likedTopics.size >= 5) awardTrophy('starred_5');
  }, [streak.total, streak.current, likedTopics.size, awardTrophy]);

  // Sync stats first (merges local + DB taking max), then fetch the result
  useEffect(() => {
    if (!user) return;
    (async () => {
      await syncFullStats(streak);
      const data = await fetchProfile();
      if (data) setDbProfile(data);
    })();
  }, [user?.id]);

  const displayName = dbProfile?.display_name
    ?? user?.user_metadata?.display_name
    ?? user?.email?.split('@')[0]
    ?? null;

  const divesLabel = history.length === 1
    ? t('dives_one')
    : t('dives_many', { n: history.length });

  // Stats: prefer DB values when signed in (more accurate across devices)
  const stats = user && dbProfile ? [
    {
      label: t('stat_streak'),
      value: `${dbProfile.daily_streak ?? streak.current}d`,
      sub: streakBadge ? t(streakBadge.key) : (streak.current > 0 ? t('keep_going') : t('start_today')),
    },
    { label: t('stat_best'),    value: `${dbProfile.longest_streak ?? streak.longest}d`, sub: t('longest_streak') },
    { label: t('stat_deepest'), value: `${dbProfile.deepest_dive ?? streak.deepest}`,    sub: streak.deepest !== 1 ? t('hops_p') : t('hop_s') },
    { label: t('stat_total'),   value: dbProfile.total_dives ?? streak.total,            sub: t('dives_p') },
  ] : [
    {
      label: t('stat_streak'),
      value: `${streak.current}d`,
      sub: streakBadge ? t(streakBadge.key) : (streak.current > 0 ? t('keep_going') : t('start_today')),
    },
    { label: t('stat_best'),    value: `${streak.longest}d`, sub: t('longest_streak') },
    { label: t('stat_deepest'), value: `${streak.deepest}`,  sub: streak.deepest !== 1 ? t('hops_p') : t('hop_s') },
    { label: t('stat_total'),   value: streak.total,          sub: t('dives_p') },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          {user && displayName && (
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#E8432D] border-2 border-black shadow-[2px_2px_0_#111] flex items-center justify-center font-display text-white text-lg">
                {displayName[0].toUpperCase()}
              </div>
              <span className="font-display text-xl text-fg">{displayName}</span>
            </div>
          )}
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

      {/* Not signed in — sign-in prompt */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 card shadow-[5px_5px_0_#111] p-6 flex flex-col sm:flex-row items-center gap-5"
        >
          <div className="text-5xl shrink-0">🔐</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display text-2xl text-black mb-1">{t('profile_signin_title')}</p>
            <p className="font-body text-sm text-black/55">{t('profile_signin_sub')}</p>
          </div>
          <button
            onClick={openAuthModal}
            className="shrink-0 font-body font-bold text-sm px-5 py-2.5 bg-[#E8432D] text-white border-2 border-black rounded-xl shadow-[3px_3px_0_#111] btn-press"
          >
            {t('profile_signin_btn')}
          </button>
        </motion.div>
      )}

      {/* Stats panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, sub }) => (
          <div key={label} className="card shadow-[4px_4px_0_#111] p-4 text-center">
            <p className="font-body text-[10px] text-black/50 uppercase tracking-widest mb-1">{label}</p>
            <p className="font-display text-2xl text-[#E8432D]">{value}</p>
            {sub && <p className="font-body text-xs text-black/50 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Daily wins stat — only when signed in */}
      {user && dbProfile?.daily_wins != null && (
        <div className="card shadow-[4px_4px_0_#111] p-4 mb-8 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="font-display text-2xl text-[#E8432D]">{dbProfile.daily_wins}</p>
            <p className="font-body text-xs text-black/50">{t('profile_daily_wins')}</p>
          </div>
        </div>
      )}

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
            const earnedOn = earnedDates[trophy.id];
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
                {isEarned && earnedOn && (
                  <p className="font-body text-[10px] text-black/35 mt-0.5">{fmt(earnedOn)}</p>
                )}
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
                      className="font-body text-xs px-3 py-2 border-2 border-red-400 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                      title={t('remove_starred')}
                    >
                      ♥
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="mb-8">
        <h2 className="font-display text-2xl text-fg mb-4">{t('settings_title')}</h2>
        <div className="card shadow-[4px_4px_0_#111] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-body font-bold text-sm text-black">{t('skip_anim_label')}</p>
              <p className="font-body text-xs text-black/50 mt-0.5">{t('skip_anim_sub')}</p>
            </div>
            <button
              onClick={toggleSkipAnim}
              className={`relative w-12 h-6 rounded-full border-2 border-black transition-colors flex-shrink-0 overflow-hidden p-0 ${skipAnim ? 'bg-[#E8432D]' : 'bg-black/10'}`}
              aria-label={t('skip_anim_label')}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-all duration-200 ${skipAnim ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

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

      {/* Newsletter */}
      <div className="mb-8">
        <NewsletterSignup />
      </div>

      {/* Contact */}
      <p className="text-center font-body text-sm text-fg-faint mt-2 mb-8">
        {t('contact_line')}{' '}
        <a
          href="mailto:contact@followthehole.com"
          className="text-fg-muted underline underline-offset-2 hover:text-fg transition-colors"
        >
          contact@followthehole.com
        </a>
      </p>

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
              <>
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
                <SocialShare chain={session.chain} startTopic={session.startTopic} compact />
              </>
            ) : (
              <p className="font-body text-sm text-black/40 italic">{t('peeked_in')}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
