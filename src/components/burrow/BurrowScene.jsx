import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCarrots } from '../../hooks/useCarrots';
import { useOutfit } from '../../hooks/useCosmetics';
import PixelRabbit from '../PixelRabbit';
import PixelWorm from '../PixelWorm';

// Pixel-art underground cross-section: the rabbit at home with its trophies,
// carrot stash, streak flame and deepest-dive marker.
export default function BurrowScene({ trophiesEarned, trophiesTotal, streak, deepest }) {
  const { t } = useLanguage();
  const { balance } = useCarrots();
  const outfit = useOutfit();

  return (
    <div className="card overflow-hidden shadow-[6px_6px_0_#111] mb-8 select-none">
      {/* Surface strip with the hole entrance */}
      <div className="relative h-14" style={{ background: 'linear-gradient(180deg, #F7C948 0%, #E8B83A 100%)' }}>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-28 h-7 rounded-t-[50%]" style={{ background: '#1A0F08' }} />
        <span className="absolute left-5 top-3 text-xl" aria-hidden>🌱</span>
        <span className="absolute right-6 top-2 text-2xl" aria-hidden>🌻</span>
        {/* grass blades */}
        <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: '#1B3A1A' }} />
      </div>

      {/* Underground room */}
      <div className="relative px-4 pt-5 pb-4" style={{ background: 'linear-gradient(180deg, #2A1A0E 0%, #1A0F08 100%)' }}>
        {/* dirt speckles */}
        {[['8%', '18%'], ['88%', '12%'], ['14%', '78%'], ['92%', '70%'], ['50%', '8%'], ['72%', '85%']].map(([left, top], i) => (
          <span key={i} className="absolute w-1.5 h-1.5 rounded-sm" style={{ left, top, background: 'rgba(255,255,255,0.08)' }} aria-hidden />
        ))}

        <div className="relative flex items-end justify-between gap-3">
          {/* Trophy shelf */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className="flex gap-1 items-end px-2 pb-1 border-b-4 rounded-sm" style={{ borderColor: '#6D4C41' }}>
              {Array.from({ length: Math.min(5, Math.max(1, trophiesEarned)) }).map((_, i) => (
                <span key={i} className="text-base" style={{ opacity: trophiesEarned > 0 ? 1 : 0.25 }} aria-hidden>🏆</span>
              ))}
            </div>
            <p className="font-body text-[10px] text-white/45 whitespace-nowrap">
              {trophiesEarned}/{trophiesTotal} 🏆
            </p>
          </div>

          {/* The rabbit at home */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <PixelRabbit width={84} outfit={outfit} />
            <div className="w-24 h-1.5 rounded-full mt-1" style={{ background: 'rgba(0,0,0,0.45)' }} />
          </motion.div>

          {/* Carrot stash */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl leading-none" aria-hidden>🥕</span>
            <p className="font-display text-lg text-[#F7C948] leading-none">{balance}</p>
            <p className="font-body text-[10px] text-white/45">{t('carrots_label')}</p>
          </div>
        </div>

        {/* Bottom row: streak + deepest + a resident worm */}
        <div className="relative flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="font-body text-xs text-white/55">
            🔥 <span className="font-display text-sm text-white">{streak}</span> {t('burrow_streak')}
          </p>
          <PixelWorm width={30} />
          <p className="font-body text-xs text-white/55">
            ⛏️ <span className="font-display text-sm text-white">{deepest}</span> {t('burrow_deepest')}
          </p>
        </div>
      </div>
    </div>
  );
}
