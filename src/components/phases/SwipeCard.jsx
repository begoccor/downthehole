import { useState, useRef, useEffect, Fragment } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLayerColor, getLayerLabel, getDepthStyle } from '../../data/layers';
import DailyBanner from './DailyBanner';
import PixelWorm from '../PixelWorm';
import PixelBeetle from '../PixelBeetle';
import PixelMole from '../PixelMole';
import PixelCentipede from '../PixelCentipede';
import PixelSpider from '../PixelSpider';
import PixelTrilobite from '../PixelTrilobite';
import PixelGolem from '../PixelGolem';
import PixelAxolotl from '../PixelAxolotl';

// ─── Trail strip ─────────────────────────────────────────────────────────────
function TrailStrip({ chain, onBranch }) {
  const [confirmIdx, setConfirmIdx] = useState(null);

  if (chain.length < 2) return null;

  const visible    = chain.slice(-3);
  const hasMore    = chain.length > 3;
  const startAbsIdx = chain.length - visible.length;

  return (
    <div className="flex items-center justify-center gap-1 mb-3 px-2"
      onClick={e => { if (e.target === e.currentTarget) setConfirmIdx(null); }}>
      {hasMore && (
        <span className="font-body text-[10px] text-white/30 select-none mr-0.5">•••</span>
      )}
      {visible.map((topic, i) => {
        const absIdx      = startAbsIdx + i;
        const isCurrent   = i === visible.length - 1;
        const age         = visible.length - 1 - i; // 0=current, 1=prev, 2=oldest
        const isConfirming = confirmIdx === absIdx;
        const label       = topic.length > 14 ? topic.slice(0, 13) + '…' : topic;

        return (
          <Fragment key={absIdx}>
            {i > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: age === 0 ? 0.45 : age === 1 ? 0.28 : 0.16 }}
                transition={{ delay: 0.05 * i }}
                className="text-white text-[9px] select-none shrink-0"
              >↘</motion.span>
            )}
            <div className="relative shrink-0">
              <motion.button
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: isCurrent ? 1 : age === 1 ? 0.65 : 0.38,
                  y: 0,
                  scale: isCurrent ? 1 : age === 1 ? 0.95 : 0.88,
                }}
                transition={{ delay: 0.06 * i, duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
                whileTap={isCurrent ? {} : { scale: 1.12 }}
                disabled={isCurrent}
                onClick={() => !isCurrent && setConfirmIdx(isConfirming ? null : absIdx)}
                className={`font-body text-[11px] font-bold px-2.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0_#111] select-none ${
                  isCurrent
                    ? 'bg-[#F7C948] text-black cursor-default'
                    : isConfirming
                    ? 'bg-white border-[#E8432D] text-black'
                    : 'bg-white text-black'
                }`}
              >
                {label}
              </motion.button>

              <AnimatePresence>
                {isConfirming && (
                  <motion.button
                    key="confirm"
                    initial={{ opacity: 0, y: -6, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.85 }}
                    transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                    onClick={() => { onBranch(topic); setConfirmIdx(null); }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 font-body text-[11px] font-bold px-3 py-1 bg-[#E8432D] text-white border-2 border-black rounded-full shadow-[2px_2px_0_#111] whitespace-nowrap z-20"
                  >
                    ↩ branch here
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

// ─── Dirt burst on dive-in (D5) ──────────────────────────────────────────────
const BURST = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  return {
    dx: Math.cos(angle) * (46 + (i % 3) * 26),
    dy: Math.sin(angle) * (34 + (i % 4) * 22) - 18,
    size: 4 + (i % 3) * 3,
    delay: (i % 4) * 0.03,
  };
});

function DirtBurst({ color }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20" aria-hidden>
      {BURST.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, background: color, filter: 'brightness(1.6)' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.55, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function SwipeCard({
  topic, topicIndex, total, depth, chain, justDove = false,
  rareSpawns = [], dailyPuzzle,
  onBranch, onSwipeRight, onSwipeLeft, onNewSearch, onDownvote,
}) {
  const { t } = useLanguage();
  const x = useMotionValue(0);
  const rotate    = useTransform(x, [-220, 220], [-14, 14]);
  const skipOpacity = useTransform(x, [-110, -20, 0], [1, 0.2, 0]);
  const diveOpacity = useTransform(x, [0, 20, 110],  [0, 0.2, 1]);
  const titleGlow   = useTransform(x, [0, 130], ['rgba(247,201,72,0)', 'rgba(247,201,72,0.85)']);
  const cardOpacity = useTransform(x, [-480, -160, 160, 480], [0, 1, 1, 0]);

  const [committed, setCommitted] = useState(false);
  const committedRef = useRef(false);
  const timerRef     = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Throw the card off-screen, then advance (D5). The flight animates the
  // drag motion value directly — continuing the finger's velocity so the
  // throw feels like a real release — and the advance fires on a plain
  // timer, keeping React state updates out of framer's animation callbacks.
  const commit = (dir, velocity = 0) => {
    if (committedRef.current) return;
    committedRef.current = true;
    setCommitted(true);
    navigator.vibrate?.(10);
    animate(x, dir === 'right' ? 640 : -640, {
      type: 'spring', stiffness: 180, damping: 26, velocity,
    });
    timerRef.current = setTimeout(
      () => (dir === 'right' ? onSwipeRight() : onSwipeLeft()),
      190,
    );
  };

  // Commit on distance or on a quick flick, whichever comes first
  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    if (offset.x > 80 || (velocity.x > 500 && offset.x > 20))        commit('right', velocity.x);
    else if (offset.x < -80 || (velocity.x < -500 && offset.x < -20)) commit('left', velocity.x);
  };

  const ds = getDepthStyle(depth);
  const layerColor = getLayerColor(depth);
  const layerLabel = getLayerLabel(depth);
  const hopWord = depth === 1 ? t('hop') : t('hops');
  const hasRare = (id) => rareSpawns.includes(id);

  return (
    <motion.div
      key={`rel-${topicIndex}`}
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-60px-5rem)] md:min-h-[calc(100dvh-60px)] px-4 py-4 md:py-8"
    >
      {/* Pixel creatures — emerge progressively with depth */}
      <AnimatePresence>
        {depth >= 2 && (
          <motion.div key="worm-l" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <PixelWorm width={52} />
          </motion.div>
        )}
        {depth >= 4 && (
          <motion.div key="beetle-r" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute right-2 bottom-1/3 pointer-events-none">
            <PixelBeetle width={52} />
          </motion.div>
        )}
        {depth >= 6 && (
          <motion.div key="worm-r" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute right-2 top-1/3 pointer-events-none">
            <PixelWorm width={42} />
          </motion.div>
        )}
        {depth >= 8 && (
          <motion.div key="mole-l" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute left-2 bottom-1/3 pointer-events-none">
            <PixelMole width={58} />
          </motion.div>
        )}
        {depth >= 10 && (
          <motion.div key="beetle-l" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute left-2 top-1/3 pointer-events-none">
            <PixelBeetle width={42} />
          </motion.div>
        )}
        {depth >= 12 && (
          <motion.div key="centipede-b" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
            <PixelCentipede width={90} />
          </motion.div>
        )}
        {depth >= 15 && (
          <motion.div key="spider-r" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <PixelSpider width={60} />
          </motion.div>
        )}
        {depth >= 20 && (
          <motion.div key="mole-r" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute right-2 bottom-1/2 pointer-events-none">
            <PixelMole width={46} />
          </motion.div>
        )}
        {/* Rare spawns — only some sessions (B2) */}
        {depth >= 16 && hasRare('trilobite') && (
          <motion.div key="trilobite-l" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute left-3 bottom-20 pointer-events-none">
            <PixelTrilobite width={50} />
          </motion.div>
        )}
        {depth >= 25 && hasRare('golem') && (
          <motion.div key="golem-r" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="absolute right-3 top-24 pointer-events-none">
            <PixelGolem width={64} />
          </motion.div>
        )}
        {depth >= 5 && hasRare('axolotl') && (
          <motion.div key="axolotl" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="absolute left-4 top-24 pointer-events-none">
            <PixelAxolotl width={56} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily puzzle banner */}
      {dailyPuzzle && (
        <div className="mb-2 z-10">
          <DailyBanner puzzle={dailyPuzzle} hops={depth} dark />
        </div>
      )}

      {/* Depth + layer badge */}
      <div className="relative">
        <motion.div
          key={`depth-${depth}`}
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 shadow-[2px_2px_0_rgba(0,0,0,0.3)] font-body font-bold text-sm"
          style={{ background: ds.bg, color: ds.text, borderColor: ds.border }}
        >
          <span className="font-display text-base">{depth}</span>
          <span className="text-xs">{hopWord}</span>
          <span className="text-xs opacity-75">·</span>
          <span className="text-xs opacity-90">{layerLabel}</span>
        </motion.div>
        {/* "+1" pop after a dive (D5) */}
        {justDove && (
          <motion.span
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -26, scale: 1.25 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute -right-7 top-0 font-display text-lg text-[#F7C948] pointer-events-none select-none"
            aria-hidden
          >
            +1
          </motion.span>
        )}
      </div>

      <TrailStrip chain={chain} onBranch={onBranch} />

      <p className="font-display text-xl text-white mb-1">{t('related_card')}</p>
      <p className="font-body text-sm text-white/65 mb-3 md:mb-5 tracking-wide">
        {t('swipe_hint', { n: topicIndex + 1, total })}
      </p>

      <div className="flex justify-between w-full max-w-sm mb-3 px-1">
        <motion.span style={{ opacity: skipOpacity }} className="font-display text-lg text-[#E8432D]">
          {t('skip_left')}
        </motion.span>
        <motion.span style={{ opacity: diveOpacity }} className="font-display text-lg text-[#F7C948]">
          {t('dive_in')}
        </motion.span>
      </div>

      <div className="relative w-full max-w-sm">
        {justDove && <DirtBurst color={layerColor} />}

        <motion.div
          drag={committed ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8}
          dragTransition={{ bounceStiffness: 500, bounceDamping: 32 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity: cardOpacity }}
          whileTap={{ cursor: 'grabbing' }} whileDrag={{ scale: 1.03 }}
          className="relative w-full card shadow-[8px_8px_0_#111] overflow-hidden cursor-grab touch-none select-none z-10"
        >
          {topic?.thumbnail?.source && (
            <img src={topic.thumbnail.source} alt={topic.title}
              className="w-full h-32 sm:h-44 object-cover border-b-4 border-black" />
          )}
          <div className="p-5 md:p-6">
            <motion.h3
              style={{ backgroundColor: titleGlow }}
              className="font-display text-[1.8rem] text-[#E8432D] leading-tight mb-2 rounded-md px-1 -mx-1"
            >
              {topic?.title?.toUpperCase()}
            </motion.h3>
            {topic?.description && (
              <p className="font-body text-xs text-black/50 uppercase tracking-widest mb-2">{topic.description}</p>
            )}
            <p className="font-body text-[0.95rem] leading-relaxed text-black/75">
              {topic?.extract
                ? topic.extract.slice(0, 160).trimEnd() + (topic.extract.length > 160 ? '…' : '')
                : ''}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-3 mt-4 md:mt-6 w-full max-w-sm z-10">
        <button onClick={() => commit('left')}
          className="flex-1 py-3 font-display text-lg text-black card shadow-[4px_4px_0_#111] btn-press"
        >
          {t('skip_left')}
        </button>
        <button onClick={() => commit('right')}
          className="flex-1 py-3 font-display text-lg bg-[#F7C948] text-black border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
        >
          {t('dive_in')}
        </button>
      </div>

      <div className="flex items-center justify-center gap-5 mt-4 z-10">
        <button onClick={onNewSearch}
          className="font-body text-sm text-white/45 hover:text-white underline transition-colors"
        >
          {t('start_over')}
        </button>
        <span className="text-white/25 text-xs">·</span>
        <button
          onClick={() => { onDownvote(topic.title); commit('left'); }}
          className="font-body text-sm text-white/45 hover:text-[#E8432D] transition-colors flex items-center gap-1"
        >
          👎 {t('downvote_btn')}
        </button>
      </div>
    </motion.div>
  );
}
