import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import Stars from './Stars';

export default function ChallengePhase({ trail, onAccept, onContinue, onDecline }) {
  const { t } = useLanguage();
  const startTopic = trail[0];
  const lastTopic  = trail[trail.length - 1];
  const n          = trail.length;
  const hopWord    = n === 1 ? t('hop') : t('hops');

  // Collapse long trails for display: show first 2, ···, last 2
  const displayTrail = trail.length > 5
    ? [trail[0], trail[1], '···', trail[trail.length - 2], trail[trail.length - 1]]
    : trail;

  return (
    <motion.div
      key="challenge"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] px-6 py-10"
    >
      <Stars />

      <div className="z-10 w-full max-w-md mx-auto flex flex-col items-center gap-6">
        {/* Header */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="font-body text-xs text-fg-faint uppercase tracking-widest mb-2"
          >
            🎯 {t('challenge_heading')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#F7C948] border-4 border-black rounded-full shadow-[4px_4px_0_#111] mb-3"
          >
            <span className="font-display text-3xl text-black">{n}</span>
            <span className="font-body text-sm font-bold text-black/70">{hopWord}</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="font-body text-base text-fg-muted"
          >
            {t('challenge_sub', { n, start: startTopic })}
            <br />
            <span className="font-body font-bold text-fg">{t('challenge_sub2')}</span>
          </motion.p>
        </div>

        {/* Trail card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full card shadow-[6px_6px_0_#111] p-4"
        >
          <p className="font-body text-[10px] uppercase tracking-widest text-black/40 mb-3">
            {t('challenge_trail_lbl')}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {displayTrail.map((topic, i) => {
              const isEllipsis = topic === '···';
              const isFirst    = i === 0;
              const isLast     = i === displayTrail.length - 1;
              return (
                <span key={i} className="flex items-center gap-2">
                  {isEllipsis ? (
                    <span className="font-body text-sm text-black/40 px-1">···</span>
                  ) : (
                    <span className={`font-body text-sm border-2 border-black rounded-full px-3 py-1 font-semibold ${
                      isFirst ? 'bg-[#F7C948] text-black'
                      : isLast  ? 'bg-[#E8432D] text-white'
                      : 'bg-white text-black'
                    }`}>
                      {topic.length > 22 ? topic.slice(0, 21) + '…' : topic}
                    </span>
                  )}
                  {i < displayTrail.length - 1 && !isEllipsis && displayTrail[i + 1] !== '···' && (
                    <span className="text-black/30 font-bold text-xs">→</span>
                  )}
                  {displayTrail[i + 1] === '···' && (
                    <span className="text-black/30 font-bold text-xs">→</span>
                  )}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full flex flex-col gap-3"
        >
          <button
            onClick={onAccept}
            className="w-full py-4 bg-[#E8432D] text-white font-display text-xl border-4 border-black rounded-2xl shadow-[6px_6px_0_#111] btn-press"
          >
            {t('challenge_accept', { topic: startTopic })}
          </button>
          {lastTopic !== startTopic && (
            <button
              onClick={onContinue}
              className="w-full py-3 font-display text-base text-black card shadow-[3px_3px_0_#111] btn-press"
            >
              {t('challenge_continue', { topic: lastTopic })}
            </button>
          )}
          <button
            onClick={onDecline}
            className="font-body text-sm text-fg-faint hover:text-fg transition-colors text-center underline"
          >
            {t('challenge_decline')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
