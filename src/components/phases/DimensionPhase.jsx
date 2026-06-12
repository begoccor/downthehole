import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  left:     `${(i * 37 + 13) % 100}%`,
  top:      `${(i * 53 + 7) % 100}%`,
  duration: 1 + (i % 5) * 0.4,
  delay:    (i * 0.17) % 2,
  size:     i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
}));

export default function DimensionPhase({ onContinue }) {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(onContinue, 7000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <motion.div
      key="dimension"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center overflow-hidden px-6"
      style={{ background: 'linear-gradient(135deg, #0D001A 0%, #4A148C 40%, #7B1FA2 70%, #1A237E 100%)' }}
    >
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} bg-white rounded-full`}
          style={{ left: p.left, top: p.top }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}

      <motion.h1
        animate={{ x: [-2, 2, -1, 0], opacity: [1, 0.7, 1] }}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 0.8 }}
        className="font-display text-[clamp(2rem,8vw,4.5rem)] text-white leading-tight mb-4 z-10"
      >
        {t('too_deep_1')}<br />{t('too_deep_2')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="font-body text-xl z-10 mb-6"
        style={{ color: '#CE93D8' }}
      >
        {t('too_deep_sub')}
      </motion.p>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.5, type: 'spring', bounce: 0.5 }}
        className="text-8xl mb-6 z-10"
      >
        ⚫
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }}
        className="z-10 card shadow-[6px_6px_0_#111] px-6 py-4 mb-6 text-center"
      >
        <p className="font-body text-xs text-black/40 uppercase tracking-widest mb-1">
          {t('trophy_unlocked')}
        </p>
        <p className="font-display text-2xl text-yellow-600">{t('trophy_hop_50_name')}</p>
        <p className="font-body text-sm text-black/60">{t('bh_legendary')}</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }}
        onClick={onContinue}
        className="z-10 font-body text-sm hover:text-white transition-colors"
        style={{ color: 'rgba(206,147,216,0.6)' }}
      >
        {t('continue_btn')}
      </motion.button>
    </motion.div>
  );
}
