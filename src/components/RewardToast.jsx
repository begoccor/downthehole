import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

// Listens for `dth-reward` window events (carrots earned, quests completed,
// creatures met) and shows them one at a time.
export default function RewardToast() {
  const { t } = useLanguage();
  const [toast, setToast] = useState(null);
  const queueRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const showNext = () => {
      const next = queueRef.current.shift() ?? null;
      setToast(next);
      timerRef.current = next ? setTimeout(showNext, 3500) : null;
    };
    const onReward = (e) => {
      queueRef.current.push(e.detail);
      if (!timerRef.current) showNext();
    };
    window.addEventListener('dth-reward', onReward);
    return () => {
      window.removeEventListener('dth-reward', onReward);
      clearTimeout(timerRef.current);
    };
  }, []);

  const content = toast && (
    toast.type === 'quest' ? {
      emoji: '📜',
      title: t('quest_done_toast'),
      sub:   `${t(`qn_${toast.questId}`)} · +${toast.amount} 🥕`,
    } : toast.type === 'creature' ? {
      emoji: '🐾',
      title: t('creature_met_toast'),
      sub:   `${t(`cr_${toast.creatureId}_name`)} · +${toast.amount} 🥕`,
    } : {
      emoji: '🥕',
      title: `+${toast.amount} 🥕`,
      sub:   toast.reason ? t(toast.reason) : null,
    }
  );

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={`${toast.type}-${toast.questId ?? toast.creatureId ?? toast.amount}`}
          initial={{ opacity: 0, y: 24, scale: 0.93 }}
          animate={{ opacity: 1, y: 0,  scale: 1   }}
          exit={{    opacity: 0, y: 10, scale: 0.96 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] card border-4 border-[#F7C948] px-5 py-3 flex items-center gap-3 whitespace-nowrap shadow-[0_0_14px_rgba(247,201,72,0.45)]"
        >
          <motion.span
            animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-3xl"
          >
            {content.emoji}
          </motion.span>
          <div>
            <p className="font-display text-lg text-black leading-tight">{content.title}</p>
            {content.sub && <p className="font-body text-sm text-black/60">{content.sub}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
