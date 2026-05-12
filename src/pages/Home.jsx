import { useState, useEffect, useRef } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
} from 'framer-motion';
import { searchTopic, fetchRelated, fetchFullIntro, fetchArticleImages, extractFacts } from '../hooks/useWikipedia';
import { useDownvotes } from '../hooks/useDownvotes';
import { useHistory } from '../hooks/useHistory';
import { useStreak, getDepthBadge } from '../hooks/useStreak';
import { useTrophies } from '../contexts/TrophyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getDailyTopic } from '../data/dailyTopics';
import PixelEarth from '../components/PixelEarth';
import PixelRabbit from '../components/PixelRabbit';
import PixelWorm from '../components/PixelWorm';
import PixelBeetle from '../components/PixelBeetle';
import PixelMole from '../components/PixelMole';
import PixelCentipede from '../components/PixelCentipede';
import PixelSpider from '../components/PixelSpider';

// ─── Earth layer background system ───────────────────────────────────────────
const LAYERS = [
  { depth: 0,  color: '#1B3A1A', label: '🌱 Surface'         },
  { depth: 4,  color: '#6D4C41', label: '🌿 Topsoil'         },
  { depth: 9,  color: '#4E342E', label: '🌑 Deep soil'       },
  { depth: 16, color: '#37474F', label: '💎 Rock layer'      },
  { depth: 25, color: '#7B2D00', label: '🌋 Magma approach'  },
  { depth: 35, color: '#8B0000', label: '🔥 Earth core'      },
  { depth: 50, color: '#1A0030', label: '🌌 Another dimension' },
];

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  left:     `${(i * 37 + 13) % 100}%`,
  top:      `${(i * 53 + 7) % 100}%`,
  duration: 1 + (i % 5) * 0.4,
  delay:    (i * 0.17) % 2,
  size:     i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
}));

function getLayerColor(depth) {
  return [...LAYERS].reverse().find(l => depth >= l.depth)?.color ?? LAYERS[0].color;
}

function getLayerLabel(depth) {
  return [...LAYERS].reverse().find(l => depth >= l.depth)?.label ?? LAYERS[0].label;
}

function getDepthStyle(depth) {
  if (depth >= 35) return { bg: '#8B0000', text: '#FFD0D0', border: 'rgba(255,100,100,0.5)' };
  if (depth >= 25) return { bg: '#7B2D00', text: '#FFD0A0', border: 'rgba(255,150,50,0.5)'  };
  if (depth >= 16) return { bg: '#37474F', text: '#CFD8DC', border: 'rgba(150,200,220,0.4)' };
  if (depth >= 9)  return { bg: '#5D4037', text: '#FFCCBC', border: 'rgba(200,130,100,0.4)' };
  if (depth >= 5)  return { bg: '#F7C948', text: '#111111', border: 'rgba(0,0,0,0.3)'       };
  return               { bg: '#FFFFFF', text: '#111111', border: 'rgba(0,0,0,0.25)'      };
}

// ─── O — tilted hole, tunnel rings vanishing into the void ───────────────────
function OArrow() {
  return (
    <svg
      viewBox="0 0 90 68"
      style={{ display: 'inline-block', height: '0.75em', width: 'auto', verticalAlign: '0' }}
      aria-hidden
    >
      {/*
        Group rotated -8° so the whole O tilts slightly.
        Inside: a solid dark fill (the void) + white semi-transparent rings
        shrinking toward a vanishing point — visible in both dark and light mode
        because white-on-black works regardless of page background.
      */}
      <g transform="rotate(-8 45 34)">
        {/* The void — solid dark base so depth rings have contrast in dark mode */}
        <ellipse cx="45" cy="34" rx="22" ry="14" fill="rgba(0,0,0,0.82)" />
        {/* Depth rings — white, fading as they recede */}
        <ellipse cx="45" cy="32" rx="17" ry="10.5" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" />
        <ellipse cx="45" cy="31" rx="12" ry="7.5"  fill="none" stroke="rgba(255,255,255,0.19)" strokeWidth="1.5" />
        <ellipse cx="45" cy="30" rx="8"  ry="5"    fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
        <ellipse cx="45" cy="29" rx="5"  ry="3"    fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
        {/* Pure void at the vanishing point */}
        <ellipse cx="45" cy="28" rx="3"  ry="1.8"  fill="black" />
        {/* Outer O ring */}
        <ellipse cx="45" cy="34" rx="34" ry="22"
          fill="none" stroke="currentColor" strokeWidth="12"
        />
      </g>
    </svg>
  );
}

// ─── Stars (input phase) ──────────────────────────────────────────────────────
function Stars() {
  const positions = [
    { top: '8%',  left: '6%'  }, { top: '12%', left: '88%' },
    { top: '72%', left: '5%'  }, { top: '78%', left: '91%' },
    { top: '45%', left: '3%'  }, { top: '40%', left: '95%' },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {positions.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl select-none"
          style={{ ...p, color: 'var(--star)' }}
          animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

// ─── Dimension easter egg (50 hops) ──────────────────────────────────────────
function DimensionPhase({ onContinue }) {
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

// ─── Phase 1: Input ───────────────────────────────────────────────────────────
function InputPhase({ onSearch, error, sharedTrail, likedTopics }) {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const dailyTopic = getDailyTopic();

  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <motion.div
      key="input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-10"
    >
      <Stars />

      {sharedTrail && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-6 z-10 card shadow-[4px_4px_0_#111] p-4"
        >
          <p className="font-body text-xs text-black/50 uppercase tracking-widest mb-2">
            {t('shared_trail')}
          </p>
          <div className="flex flex-wrap gap-1.5 items-center mb-3">
            {sharedTrail.map((topic, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="font-body text-sm bg-[#F7C948] border-2 border-black rounded-full px-2.5 py-0.5 font-semibold">{topic}</span>
                {i < sharedTrail.length - 1 && <span className="text-black/30 font-bold">→</span>}
              </span>
            ))}
          </div>
          <button
            onClick={() => onSearch(sharedTrail[sharedTrail.length - 1])}
            className="font-body text-xs font-bold text-[#E8432D] hover:underline"
          >
            {t('continue_from', { topic: sharedTrail[sharedTrail.length - 1] })}
          </button>
        </motion.div>
      )}

      <motion.h1
        initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
        className="font-display text-[clamp(3rem,12vw,7rem)] text-fg text-center leading-none mb-2 z-10"
      >
        DOWN<br />THE H<OArrow />LE
      </motion.h1>
      <motion.p
        initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        className="font-body text-lg text-fg-muted mb-8 text-center z-10"
      >
        {t('tagline')}
      </motion.p>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -14, 0] }}
        transition={{
          scale: { delay: 0.2, duration: 0.5 }, opacity: { delay: 0.2, duration: 0.5 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
        }}
        className="mb-8 z-10"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.22))' }}
      >
        <PixelEarth size={180} />
      </motion.div>

      <motion.form
        onSubmit={submit}
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="w-full max-w-md z-10 space-y-3"
      >
        <input
          type="text" value={value} onChange={e => setValue(e.target.value)}
          placeholder={t('placeholder')} autoFocus
          className="w-full px-5 py-4 text-lg font-body border-4 border-black rounded-2xl bg-white text-black shadow-[6px_6px_0_#111] focus:outline-none placeholder-black/30"
        />
        {error && <p className="text-center text-[#E8432D] font-body font-bold text-sm">{error}</p>}
        <button
          type="submit" disabled={!value.trim()}
          className="w-full py-4 bg-[#E8432D] text-white font-display text-2xl border-4 border-black rounded-2xl shadow-[6px_6px_0_#111] btn-press disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('dive_btn')}
        </button>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="font-body text-sm text-fg-faint">{t('daily_label')}</span>
          <button
            type="button" onClick={() => onSearch(dailyTopic)}
            className="font-body text-sm font-bold px-3 py-1.5 bg-[#F7C948] text-black border-2 border-black rounded-xl shadow-[2px_2px_0_#111] btn-press"
          >
            🔥 {dailyTopic}
          </button>
        </div>
      </motion.form>

      {likedTopics?.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="w-full max-w-md z-10 mt-5"
        >
          <p className="font-body text-xs text-fg-faint text-center mb-2 uppercase tracking-widest">
            {t('starred_label')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[...likedTopics].slice(0, 6).map(topic => (
              <button
                key={topic} type="button" onClick={() => onSearch(topic)}
                className="font-body text-sm font-semibold px-3 py-1.5 bg-red-500 text-white border-2 border-black rounded-full shadow-[2px_2px_0_#111] btn-press"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Phase 2: Loading ─────────────────────────────────────────────────────────
function LoadingPhase() {
  const { t } = useLanguage();
  return (
    <motion.div
      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] gap-4"
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}>
        <PixelEarth size={80} animate={false} />
      </motion.div>
      <p className="font-display text-2xl text-fg">{t('loading')}</p>
    </motion.div>
  );
}

// ─── Phase 3: Transition ──────────────────────────────────────────────────────
function TransitionPhase({ onSkip }) {
  const { t } = useLanguage();
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
        <PixelRabbit width={90} />
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

// Splits Wikipedia extract into paragraphs based on detail level
function extractParagraphs(text, level = 'some') {
  if (!text) return [];
  const minLen = level === 'learn' ? 25 : 55;
  const maxP   = level === 'learn' ? 10 : 3;
  return text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > minLen)
    .slice(0, maxP);
}

const DETAIL_LEVELS = [
  { id: 'some',  key: 'detail_some'  },
  { id: 'learn', key: 'detail_learn' },
];

// ─── Phase 4: Facts ───────────────────────────────────────────────────────────
function FactsPhase({ topicData, facts, onNext, onNewSearch, liked, onLike }) {
  const { lang, t } = useLanguage();
  const [detailLevel, setDetailLevel] = useState('some');
  const [fullIntro, setFullIntro]     = useState(null);  // null=unfetched, ''=empty
  const [loadingIntro, setLoadingIntro] = useState(false);
  const [images, setImages]           = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    setLoadingImages(true);
    setImages([]);
    fetchArticleImages(topicData.title, lang)
      .then(imgs => { setImages(imgs); setLoadingImages(false); })
      .catch(() => { setImages([]); setLoadingImages(false); });
  }, [topicData.title, lang]);

  // Lazy-fetch the full Wikipedia intro only when the user picks "I want to learn"
  useEffect(() => {
    if (detailLevel !== 'learn' || fullIntro !== null || loadingIntro) return;
    setLoadingIntro(true);
    fetchFullIntro(topicData.title, lang)
      .then(text => { setFullIntro(text); setLoadingIntro(false); })
      .catch(() => { setFullIntro(''); setLoadingIntro(false); });
  }, [detailLevel, fullIntro, loadingIntro, topicData.title, lang]);

  const textSource = detailLevel === 'learn' ? (fullIntro ?? topicData.extract) : topicData.extract;
  const paragraphs = extractParagraphs(textSource, detailLevel);

  return (
    <motion.div
      key="facts"
      initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      {/* Topic header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          {topicData.description && (
            <p className="font-body text-xs text-fg-faint uppercase tracking-widest mb-1">
              {topicData.description}
            </p>
          )}
          <h1 className="font-display text-[clamp(2rem,8vw,3.5rem)] text-fg leading-tight break-words">
            {topicData.title.toUpperCase()}
          </h1>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
          <motion.button
            onClick={onLike} whileTap={{ scale: 1.35 }} whileHover={{ scale: 1.1 }}
            title={liked ? t('remove_starred') : t('starred_label')}
            className={`w-12 h-12 rounded-2xl border-4 border-black flex items-center justify-center text-2xl shadow-[4px_4px_0_#111] transition-colors ${
              liked ? 'bg-red-500 text-white' : 'bg-white text-black'
            }`}
          >
            {liked ? '♥' : '♡'}
          </motion.button>
          <a
            href={topicData.content_urls?.desktop?.page} target="_blank" rel="noreferrer"
            className="font-body text-[10px] text-fg-faint hover:text-fg-muted underline transition-colors text-center leading-tight"
          >
            Wikipedia ↗
          </a>
        </div>
      </div>

      {/* Depth selector — how deep do you want to go? */}
      <div className="selector-track flex gap-1 p-1 rounded-2xl mb-5">
        {DETAIL_LEVELS.map(({ id, key }) => (
          <motion.button
            key={id}
            onClick={() => setDetailLevel(id)}
            layout
            className={`flex-1 font-body text-sm font-bold py-2 px-3 rounded-xl transition-colors ${
              detailLevel === id
                ? 'bg-[#E8432D] text-white shadow-[2px_2px_0_rgba(0,0,0,0.25)]'
                : 'selector-option'
            }`}
          >
            {t(key)}
          </motion.button>
        ))}
      </div>

      {/* Two-column body */}
      <div className="flex flex-col md:flex-row gap-5 mb-5">

        {/* LEFT — Images (falls back to quick facts if none available) */}
        <div className="md:w-56 lg:w-64 shrink-0">
          {loadingImages ? (
            <div className="flex flex-col gap-3">
              {[180, 140].map((h, i) => (
                <div key={i} className="card shadow-[4px_4px_0_#111] overflow-hidden animate-pulse"
                  style={{ height: h, background: 'rgba(0,0,0,0.06)' }} />
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="flex flex-col gap-3">
              {images.slice(0, 4).map((img, i) => (
                <motion.div
                  key={img.url}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="card shadow-[4px_4px_0_#111] overflow-hidden"
                >
                  <img src={img.url} alt={img.title}
                    className="w-full object-cover block"
                    style={{ maxHeight: '170px' }} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card shadow-[6px_6px_0_#111] p-5 h-full">
              <h2 className="font-display text-lg text-black mb-3">{t('quick_facts')}</h2>
              {facts.length > 0 ? (
                <ul className="space-y-3">
                  {facts.map((fact, i) => (
                    <motion.li key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.07 * i, duration: 0.3 }}
                      className="flex gap-2 items-start"
                    >
                      <span className="font-display text-[#E8432D] text-sm mt-0.5 shrink-0">{i + 1}.</span>
                      <p className="font-body text-sm text-black/80 leading-relaxed">{fact}</p>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="font-body text-sm text-black/50 italic">{t('check_article')}</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Article paragraphs */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
              {topicData.thumbnail?.source && (
                <div className="card shadow-[6px_6px_0_#111] overflow-hidden h-52">
                  <img src={topicData.thumbnail.source} alt={topicData.title}
                    className="w-full h-full object-cover" />
                </div>
              )}

              <div className="card shadow-[6px_6px_0_#111] p-5 flex-1">
                <h2 className="font-display text-lg text-black mb-3">{t('about')}</h2>
                <AnimatePresence mode="wait">
                  {loadingIntro ? (
                    <motion.div key="loading-intro"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="space-y-2 py-1"
                    >
                      {[80, 100, 65, 90].map((w, i) => (
                        <div key={i} className="h-3 rounded-full bg-black/10 animate-pulse"
                          style={{ width: `${w}%` }} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={detailLevel}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {paragraphs.length > 0 ? (
                        <div className="space-y-3">
                          {paragraphs.map((para, i) => (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * i, duration: 0.3 }}
                              className="font-body text-[0.95rem] text-black/80 leading-relaxed"
                            >
                              {para}
                            </motion.p>
                          ))}
                        </div>
                      ) : (
                        <p className="font-body text-sm text-black/50 italic">{t('no_text')}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex gap-3">
        <button onClick={onNewSearch}
          className="px-5 py-3 font-display text-lg text-black card shadow-[4px_4px_0_#111] btn-press whitespace-nowrap"
        >
          {t('new_topic')}
        </button>
        <button onClick={onNext}
          className="flex-1 py-3 font-display text-xl bg-[#E8432D] text-white border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
        >
          {t('related_btn')}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Phase 5: Swipe card ──────────────────────────────────────────────────────
function SwipeCard({ topic, topicIndex, total, depth, onSwipeRight, onSwipeLeft, onNewSearch, onDownvote }) {
  const { t } = useLanguage();
  const x = useMotionValue(0);
  const rotate    = useTransform(x, [-220, 220], [-14, 14]);
  const skipOpacity = useTransform(x, [-110, -20, 0], [1, 0.2, 0]);
  const diveOpacity = useTransform(x, [0, 20, 110],  [0, 0.2, 1]);
  const titleGlow   = useTransform(x, [0, 130], ['rgba(247,201,72,0)', 'rgba(247,201,72,0.85)']);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 90)       onSwipeRight();
    else if (info.offset.x < -90) onSwipeLeft();
  };

  const ds = getDepthStyle(depth);
  const layerLabel = getLayerLabel(depth);
  const hopWord = depth === 1 ? t('hop') : t('hops');

  return (
    <motion.div
      key={`rel-${topicIndex}`}
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8"
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
      </AnimatePresence>

      {/* Depth + layer badge */}
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

      <p className="font-display text-xl text-fg mb-1">{t('related_card')}</p>
      <p className="font-body text-sm text-fg-muted mb-5 tracking-wide">
        {t('swipe_hint', { n: topicIndex + 1, total })}
      </p>

      <div className="flex justify-between w-full max-w-sm mb-3 px-1">
        <motion.span style={{ opacity: skipOpacity }} className="font-display text-lg text-[#E8432D]">
          {t('skip_left')}
        </motion.span>
        <motion.span style={{ opacity: diveOpacity }} className="font-display text-lg text-green-400">
          {t('dive_in')}
        </motion.span>
      </div>

      <motion.div
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.75}
        onDragEnd={handleDragEnd} style={{ x, rotate }} whileTap={{ cursor: 'grabbing' }}
        className="w-full max-w-sm card shadow-[8px_8px_0_#111] overflow-hidden cursor-grab touch-none select-none"
      >
        {topic?.thumbnail?.source && (
          <img src={topic.thumbnail.source} alt={topic.title}
            className="w-full h-44 object-cover border-b-4 border-black" />
        )}
        <div className="p-6">
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

      <div className="flex gap-3 mt-6 w-full max-w-sm">
        <button onClick={onSwipeLeft}
          className="flex-1 py-3 font-display text-lg text-black card shadow-[4px_4px_0_#111] btn-press"
        >
          {t('skip_left')}
        </button>
        <button onClick={onSwipeRight}
          className="flex-1 py-3 font-display text-lg bg-green-500 text-white border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
        >
          {t('dive_in')}
        </button>
      </div>

      <div className="flex items-center justify-center gap-5 mt-4">
        <button onClick={onNewSearch}
          className="font-body text-sm text-fg-faint hover:text-fg underline transition-colors"
        >
          {t('start_over')}
        </button>
        <span className="text-fg-faint text-xs">·</span>
        <button
          onClick={() => { onDownvote(topic.title); onSwipeLeft(); }}
          className="font-body text-sm text-fg-faint hover:text-[#E8432D] transition-colors flex items-center gap-1"
        >
          👎 {t('downvote_btn')}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Phase 6: Done ────────────────────────────────────────────────────────────
function DonePhase({ topic, chain, badge, onNewSearch }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const encoded = chain.map(encodeURIComponent).join('|');
    const url = `${window.location.origin}${window.location.pathname}?trail=${encoded}`;
    navigator.clipboard.writeText(url)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {});
  };

  return (
    <motion.div
      key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 text-center"
    >
      <div className="mb-5"><PixelRabbit width={100} /></div>
      {badge && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-[#F7C948] border-2 border-black rounded-full shadow-[3px_3px_0_#111]"
        >
          <span className="text-xl">{badge.emoji}</span>
          <span className="font-display text-base text-black">{t(badge.key)}</span>
          <span className="font-body text-xs text-black/60">
            · {chain.length} {chain.length === 1 ? t('hop') : t('hops')}
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
        {chain.length > 1 && (
          <motion.button onClick={handleShare} whileTap={{ scale: 0.96 }}
            className="px-6 py-3 font-display text-lg text-black bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
          >
            {copied ? t('link_copied') : t('share_trail')}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Root Home component ──────────────────────────────────────────────────────
export default function Home() {
  const [phase, setPhase]           = useState('input');
  const [error, setError]           = useState(null);
  const [topicData, setTopicData]   = useState(null);
  const [facts, setFacts]           = useState([]);
  const [related, setRelated]       = useState([]);
  const [relIdx, setRelIdx]         = useState(0);
  const [sharedTrail, setSharedTrail] = useState(null);

  const { startSession, addToChain, isLiked, toggleLike, likedTopics } = useHistory();
  const { recordDive, recordDepth }                                      = useStreak();
  const { awardTrophy }                                                  = useTrophies();
  const { lang, t }                                                      = useLanguage();
  const { downvote, isDownvoted }                                        = useDownvotes();

  const sessionRef    = useRef(null);
  const seenRef       = useRef(new Set());
  const chainRef      = useRef([]);
  const dimensionRef  = useRef(false);
  const factsTimerRef = useRef(null);

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const rawTrail = params.get('trail');
    if (rawTrail) {
      const trail = rawTrail.split('|').map(decodeURIComponent).filter(Boolean);
      if (trail.length > 0) setSharedTrail(trail);
    }
    const q = params.get('q');
    if (q) {
      window.history.replaceState({}, '', window.location.pathname);
      runSearch(decodeURIComponent(q));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceToFacts = () => {
    factsTimerRef.current = setTimeout(() => setPhase('facts'), 2100);
  };

  const goToDone = () => {
    recordDepth(chainRef.current.length);
    setPhase('done');
  };

  const runSearch = async (query, continueSession = false) => {
    setError(null);
    setPhase('loading');
    try {
      const data = await searchTopic(query, lang);
      seenRef.current.add(data.title.toLowerCase());

      const [f, allRel] = await Promise.all([
        Promise.resolve(extractFacts(data.extract)),
        fetchRelated(data.title, lang),
      ]);

      const freshRel = allRel
        .filter(r => !seenRef.current.has(r.title.toLowerCase()))
        .filter(r => !isDownvoted(r.title));
      freshRel.forEach(r => seenRef.current.add(r.title.toLowerCase()));

      setTopicData(data);
      setFacts(f);
      setRelated(freshRel);
      setRelIdx(0);

      if (continueSession && sessionRef.current) {
        addToChain(sessionRef.current, data.title);
        chainRef.current = [...chainRef.current, data.title];
      } else {
        sessionRef.current = startSession(data.title);
        chainRef.current   = [data.title];
        recordDive();
        awardTrophy('first_dive');
      }

      const depth = chainRef.current.length;
      if (depth >= 5)  awardTrophy('hop_5');
      if (depth >= 10) awardTrophy('hop_10');
      if (depth >= 25) awardTrophy('hop_25');

      const daily = getDailyTopic();
      if (data.title.toLowerCase().includes(daily.toLowerCase())) {
        awardTrophy('daily');
      }

      if (!continueSession && query.trim().toLowerCase() === 'down the rabbit hole') {
        awardTrophy('og_rabbit');
      }

      const is50 = continueSession && depth === 50 && !dimensionRef.current;
      if (is50) {
        dimensionRef.current = true;
        awardTrophy('hop_50');
        awardTrophy('dimension');
        setPhase('dimension');
      } else {
        setPhase('transition');
        advanceToFacts();
      }
    } catch {
      if (continueSession) {
        const next = relIdx + 1;
        if (next < related.length) {
          setRelIdx(next);
          setPhase('related');
        } else {
          goToDone();
        }
      } else {
        setError(t('not_found'));
        setPhase('input');
      }
    }
  };

  const reset = () => {
    clearTimeout(factsTimerRef.current);
    seenRef.current      = new Set();
    chainRef.current     = [];
    dimensionRef.current = false;
    setPhase('input');
    setTopicData(null);
    setFacts([]);
    setRelated([]);
    setRelIdx(0);
    setError(null);
    sessionRef.current = null;
  };

  const swipeRight = () => runSearch(related[relIdx].title, true);
  const swipeLeft  = () => {
    if (relIdx < related.length - 1) setRelIdx(i => i + 1);
    else goToDone();
  };

  const handleDimensionContinue = () => {
    setPhase('transition');
    advanceToFacts();
  };

  const badge = getDepthBadge(chainRef.current.length);

  const layerColor  = getLayerColor(chainRef.current.length);
  const showEarthBg = phase === 'related' || phase === 'transition';

  return (
    <div className="relative">
      <AnimatePresence>
        {showEarthBg && (
          <motion.div
            key="earth-bg"
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: layerColor }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <InputPhase key="input" onSearch={q => runSearch(q)} error={error}
            sharedTrail={sharedTrail} likedTopics={likedTopics} />
        )}
        {phase === 'loading'    && <LoadingPhase key="loading" />}
        {phase === 'dimension'  && <DimensionPhase key="dimension" onContinue={handleDimensionContinue} />}
        {phase === 'transition' && <TransitionPhase key="transition" onSkip={() => {
          clearTimeout(factsTimerRef.current);
          setPhase('facts');
        }} />}
        {phase === 'facts' && topicData && (
          <FactsPhase key="facts" topicData={topicData} facts={facts}
            liked={isLiked(topicData.title)}
            onLike={() => toggleLike(topicData.title)}
            onNext={() => related.length ? setPhase('related') : goToDone()}
            onNewSearch={reset}
          />
        )}
        {phase === 'related' && related[relIdx] && (
          <SwipeCard key={`rel-${relIdx}`}
            topic={related[relIdx]} topicIndex={relIdx} total={related.length}
            depth={chainRef.current.length}
            onSwipeRight={swipeRight} onSwipeLeft={swipeLeft} onNewSearch={reset}
            onDownvote={downvote}
          />
        )}
        {phase === 'done' && (
          <DonePhase key="done" topic={topicData?.title}
            chain={chainRef.current} badge={badge} onNewSearch={reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
