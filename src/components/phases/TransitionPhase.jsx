import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOutfit } from '../../hooks/useCosmetics';
import PixelEarth from '../PixelEarth';
import PixelRabbit from '../PixelRabbit';

export default function TransitionPhase({ onSkip }) {
  const { t } = useLanguage();
  const outfit = useOutfit();
  const [showSkip, setShowSkip] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShowSkip(true), 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div
      key="transition" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 28 }}
        transition={{ duration: 1.8, ease: [0.4, 0, 0.9, 1] }}
        className="absolute w-44 h-32 rounded-[50%]"
        style={{ background: 'var(--hole)', boxShadow: '0 0 80px 40px var(--hole)' }}
      />
      <motion.div
        initial={{ scale: 1 }} animate={{ scale: 9, y: 10 }}
        transition={{ duration: 1.4, ease: 'easeIn' }}
        className="z-10" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
      >
        <PixelEarth size={120} animate={false} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 70, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.9, duration: 0.45, ease: 'backOut' }}
        className="absolute z-20" style={{ bottom: '30%', right: '18%' }}
      >
        <PixelRabbit width={90} outfit={outfit} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.35 }}
        className="absolute font-display text-2xl text-white z-20 text-center" style={{ bottom: '20%' }}
      >
        {t('going_down')}
      </motion.p>
      {showSkip && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onSkip}
          className="absolute top-5 right-5 z-30 font-body text-sm text-white/70 hover:text-white border border-white/40 hover:border-white rounded-lg px-3 py-1.5 transition-colors"
        >
          {t('skip_btn')}
        </motion.button>
      )}
    </motion.div>
  );
}
