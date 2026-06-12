import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOutfit } from '../../hooks/useCosmetics';
import PixelEarth from '../PixelEarth';
import PixelRabbit from '../PixelRabbit';

export default function LoadingPhase() {
  const { t } = useLanguage();
  const outfit = useOutfit();
  return (
    <motion.div
      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] gap-5"
    >
      <div className="relative">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
          style={{ borderRadius: '50%', overflow: 'hidden', width: 80, height: 80 }}>
          <PixelEarth size={80} animate={false} />
        </motion.div>
        <motion.div
          className="absolute -right-7 bottom-1"
          animate={{ y: [0, -5, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PixelRabbit width={36} outfit={outfit} />
        </motion.div>
      </div>
      <p className="font-display text-2xl text-fg">{t('loading')}</p>
    </motion.div>
  );
}
