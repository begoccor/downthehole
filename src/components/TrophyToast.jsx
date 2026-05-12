import { AnimatePresence, motion } from 'framer-motion';
import { useTrophies } from '../contexts/TrophyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { RARITY_STYLES } from '../data/trophies';

export default function TrophyToast() {
  const { toast, clearToast } = useTrophies();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -70, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,   scale: 1   }}
          exit={{    opacity: 0, y: -70, scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          onClick={clearToast}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] cursor-pointer
            card border-4 ${RARITY_STYLES[toast.rarity].border}
            ${RARITY_STYLES[toast.rarity].glow}
            px-5 py-3 flex items-center gap-3 whitespace-nowrap`}
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl"
          >
            {toast.emoji}
          </motion.span>
          <div>
            <p className="font-body text-[10px] text-black/40 uppercase tracking-widest">
              {t('toast_label')} · {t(`rarity_${toast.rarity}`)}
            </p>
            <p className={`font-display text-xl ${RARITY_STYLES[toast.rarity].text}`}>
              {t(`trophy_${toast.id}_name`)}
            </p>
            <p className="font-body text-sm text-black/60">
              {t(`trophy_${toast.id}_desc`)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
