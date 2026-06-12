import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOutfit } from '../../hooks/useCosmetics';
import PixelRabbit from '../PixelRabbit';
import SocialShare from '../SocialShare';
import InviteFriends from '../InviteFriends';
import NewsletterSignup from '../NewsletterSignup';

export default function DonePhase({ topic, chain, badge, onNewSearch, isDailySession, challengeOriginalDepth }) {
  const { t } = useLanguage();
  const outfit = useOutfit();
  const n = chain.length;

  return (
    <motion.div
      key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] px-4 text-center"
    >
      <div className="mb-5"><PixelRabbit width={100} outfit={outfit} /></div>

      {/* Daily challenge complete banner */}
      {isDailySession && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', bounce: 0.35 }}
          className="mb-4 w-full max-w-xs card border-4 border-[#F7C948] shadow-[4px_4px_0_#111] p-4 text-center"
        >
          <p className="font-body text-[10px] uppercase tracking-widest text-black/50 mb-1">{t('daily_done_lbl')}</p>
          <p className="font-display text-2xl text-[#E8432D]">{t('daily_done_title', { n })}</p>
          <p className="font-body text-xs text-black/50 mt-1">{t('daily_done_sub')}</p>
        </motion.div>
      )}

      {/* Challenge result banner */}
      {challengeOriginalDepth != null && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: isDailySession ? 0.2 : 0.1, type: 'spring', bounce: 0.35 }}
          className="mb-4 w-full max-w-xs card border-4 border-black/10 shadow-[4px_4px_0_#111] p-4"
        >
          <p className="font-body text-[10px] uppercase tracking-widest text-black/50 mb-3">{t('challenge_result_lbl')}</p>
          <div className="flex gap-4 justify-center items-end mb-3">
            <div className="text-center">
              <p className="font-body text-[10px] text-black/50 mb-0.5">{t('challenge_their')}</p>
              <p className="font-display text-4xl text-black/35">{challengeOriginalDepth}</p>
            </div>
            <p className="font-body text-sm text-black/25 mb-2">vs</p>
            <div className="text-center">
              <p className="font-body text-[10px] text-black/50 mb-0.5">{t('challenge_yours')}</p>
              <p className={`font-display text-4xl ${n >= challengeOriginalDepth ? 'text-[#E8432D]' : 'text-black/70'}`}>{n}</p>
            </div>
          </div>
          <p className="font-display text-base text-center">
            {n > challengeOriginalDepth ? t('challenge_won')
              : n === challengeOriginalDepth ? t('challenge_tied')
              : t('challenge_lost')}
          </p>
        </motion.div>
      )}

      {badge && !isDailySession && challengeOriginalDepth == null && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-[#F7C948] border-2 border-black rounded-full shadow-[3px_3px_0_#111]"
        >
          <span className="text-xl">{badge.emoji}</span>
          <span className="font-display text-base text-black">{t(badge.key)}</span>
          <span className="font-body text-xs text-black/60">
            · {n} {n === 1 ? t('hop') : t('hops')}
          </span>
        </motion.div>
      )}

      <h2 className="font-display text-4xl text-fg mb-3">{t('explored_all')}</h2>
      <p className="font-body text-lg text-fg-muted mb-8 max-w-xs">
        {t('no_more', { topic })}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onNewSearch}
          className="px-8 py-4 bg-[#E8432D] text-white font-display text-2xl border-4 border-black rounded-2xl shadow-[6px_6px_0_#111] btn-press"
        >
          {t('new_hole')}
        </button>
        <SocialShare chain={chain} startTopic={topic}
          isDailySession={isDailySession}
          challengeOriginalDepth={challengeOriginalDepth} />
        <InviteFriends chain={chain} />
      </div>

      <NewsletterSignup className="w-full max-w-sm mt-6" />

    </motion.div>
  );
}
