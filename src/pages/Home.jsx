import { useState, useEffect, useRef, memo, Fragment } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
} from 'framer-motion';
import { searchTopic, fetchRelated, fetchCameo, fetchFullIntro, fetchArticleImages, extractFacts, searchSuggestions } from '../hooks/useWikipedia';
import SocialShare from '../components/SocialShare';
import { useDownvotes } from '../hooks/useDownvotes';
import { useHistory } from '../hooks/useHistory';
import { useStreak, getDepthBadge } from '../hooks/useStreak';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useTrophies } from '../contexts/TrophyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getDailyTopic } from '../data/dailyTopics';
import { DAILY_GOAL, hasWonToday, markWonToday } from '../data/dailyGoal';
import { useAuth } from '../contexts/AuthContext';
import OArrow from '../components/OArrow';
import NewsletterSignup from '../components/NewsletterSignup';
import InviteFriends from '../components/InviteFriends';
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

// ─── Stars (input phase) ──────────────────────────────────────────────────────
const STAR_DATA = [
  { top: '6%',  left: '7%',  delay: 0,   dur: 7,  size: '2rem'   },
  { top: '10%', left: '84%', delay: 1.2, dur: 9,  size: '2.5rem' },
  { top: '22%', left: '3%',  delay: 2.8, dur: 6,  size: '1.2rem' },
  { top: '38%', left: '93%', delay: 0.5, dur: 8,  size: '1rem'   },
  { top: '55%', left: '5%',  delay: 3.1, dur: 7,  size: '2rem'   },
  { top: '68%', left: '90%', delay: 1.7, dur: 10, size: '1.5rem' },
  { top: '78%', left: '11%', delay: 2.3, dur: 6,  size: '1rem'   },
  { top: '85%', left: '77%', delay: 0.9, dur: 8,  size: '0.8rem' },
  { top: '92%', left: '44%', delay: 4,   dur: 7,  size: '1.2rem' },
  { top: '48%', left: '96%', delay: 1.5, dur: 9,  size: '1.5rem' },
  { top: '30%', left: '47%', delay: 5,   dur: 11, size: '0.7rem' },
  { top: '72%', left: '51%', delay: 2.6, dur: 8,  size: '0.8rem' },
];

const Stars = memo(function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {STAR_DATA.map((s, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{ top: s.top, left: s.left, color: 'var(--star)', fontSize: s.size }}
          animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 0.85, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
});

// ─── Earth with ambient glow ──────────────────────────────────────────────────
const EarthWithGlow = memo(function EarthWithGlow({ size = 200 }) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: 'radial-gradient(circle, rgba(232,67,45,0.22) 0%, rgba(247,201,72,0.10) 45%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.30))' }}
      >
        <PixelEarth size={size} />
      </motion.div>
    </div>
  );
});

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

// ─── Daily goal win celebration ───────────────────────────────────────────────
const WIN_PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left:     `${(i * 47 + 11) % 100}%`,
  top:      `${(i * 61 + 5) % 100}%`,
  duration: 1.8 + (i % 4) * 0.6,
  delay:    (i * 0.21) % 2.8,
  emoji:    ['✦', '⭐', '✨', '🌟'][i % 4],
  size:     `${0.7 + (i % 3) * 0.45}rem`,
}));

function DailyChallengeWonPhase({ topic, chain, onContinue }) {
  const { t }  = useLanguage();
  const { user, openAuthModal } = useAuth();
  const n = chain.length - 1;
  const startTopic = chain[0];

  const displayTrail = chain.length > 5
    ? [chain[0], chain[1], '···', chain[chain.length - 2], chain[chain.length - 1]]
    : chain;

  return (
    <motion.div
      key="daily_win"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 py-10"
      style={{ background: 'linear-gradient(160deg, #0D0721 0%, #0A1800 45%, #0D0721 100%)' }}
    >
      {/* Gold particles */}
      {WIN_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{ left: p.left, top: p.top, fontSize: p.size, color: '#F7C948' }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4], rotate: [0, 180, 360] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        >
          {p.emoji}
        </motion.span>
      ))}

      <div className="z-10 w-full max-w-md mx-auto flex flex-col items-center gap-5">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.65, delay: 0.05 }}
          className="text-[5.5rem] leading-none"
        >
          🏆
        </motion.div>

        {/* Heading + sub */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-center"
        >
          <h1 className="font-display text-[clamp(2rem,8vw,3.5rem)] text-[#F7C948] leading-tight mb-2">
            {t('daily_goal_heading')}
          </h1>
          <p className="font-body text-sm text-white/60">
            {t('daily_goal_sub', { topic, n, start: startTopic })}
          </p>
        </motion.div>

        {/* Hop count badge */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring', bounce: 0.45 }}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#F7C948] border-4 border-black rounded-full shadow-[4px_4px_0_#111]"
        >
          <span className="font-display text-3xl text-black">{n}</span>
          <span className="font-body text-sm font-bold text-black/70">{n === 1 ? 'hop' : 'hops'}</span>
        </motion.div>

        {/* Trail card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="w-full rounded-2xl border-2 p-4"
          style={{ background: 'rgba(247,201,72,0.06)', borderColor: 'rgba(247,201,72,0.25)' }}
        >
          <p className="font-body text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {t('daily_goal_path')}
          </p>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {displayTrail.map((step, i) => {
              const isEllipsis = step === '···';
              const isLast     = i === displayTrail.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  {isEllipsis ? (
                    <span className="font-body text-sm px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>···</span>
                  ) : (
                    <span className={`font-body text-xs font-semibold border-2 rounded-full px-3 py-1 ${
                      isLast
                        ? 'bg-[#F7C948] border-[#F7C948] text-black'
                        : 'border-white/20 text-white/75'
                    }`} style={isLast ? {} : { background: 'rgba(255,255,255,0.07)' }}>
                      {step.length > 20 ? step.slice(0, 19) + '…' : step}
                    </span>
                  )}
                  {i < displayTrail.length - 1 && !isEllipsis && displayTrail[i + 1] !== '···' && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                  )}
                  {displayTrail[i + 1] === '···' && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                  )}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* Sign-in nudge */}
        {!user && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            onClick={openAuthModal}
            className="font-body text-sm underline"
            style={{ color: 'rgba(247,201,72,0.65)' }}
          >
            {t('daily_goal_nudge')}
          </motion.button>
        )}

        {/* Share + continue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="w-full flex flex-col items-center gap-4"
        >
          <p className="font-body text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('daily_goal_share')}
          </p>
          <SocialShare chain={chain} startTopic={startTopic} isDailyWin={true} />
          <InviteFriends chain={chain} dark />
          <button
            onClick={onContinue}
            className="font-body text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {t('daily_goal_continue')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Challenge phase ──────────────────────────────────────────────────────────
function ChallengePhase({ trail, onAccept, onContinue, onDecline }) {
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

// ─── Phase 1: Input ───────────────────────────────────────────────────────────
const GRAIN_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E";

function InputPhase({ onSearch, error, suggestions = [], sharedTrail, likedTopics }) {
  const { lang, t } = useLanguage();
  const [value, setValue] = useState('');
  const dailyTopic = getDailyTopic(lang);

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
      className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] px-6 py-10"
    >
      <Stars />
      {/* Film grain */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `url("${GRAIN_URL}")`, opacity: 0.04, backgroundSize: '200px 200px' }} />
      {/* Warm centre glow — theme-aware via CSS var */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, var(--input-glow) 0%, transparent 100%)' }} />

      {/* Shared trail banner — full width above columns */}
      {sharedTrail && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mx-auto mb-6 z-10 card shadow-[4px_4px_0_#111] p-4"
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

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-10 md:gap-20 max-w-4xl mx-auto w-full">

        {/* LEFT: title, tagline, earth (mobile only), form */}
        <div className="flex flex-col items-center md:items-start z-10 flex-1 min-w-0">
          <motion.h1
            initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
            className="font-display text-[clamp(3rem,8vw,6rem)] text-fg text-center md:text-left leading-none mb-2"
          >
            <span className="block">FOLLOW</span>
            <span className="block whitespace-nowrap">THE H<OArrow />LE</span>
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
            className="font-body text-lg text-fg-muted mb-7 text-center md:text-left"
          >
            {t('tagline')}
          </motion.p>

          {/* Earth — mobile only */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:hidden mb-8"
          >
            <EarthWithGlow size={160} />
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="w-full max-w-md mx-auto md:mx-0 space-y-3"
          >
            <input
              type="text" value={value} onChange={e => setValue(e.target.value)}
              placeholder={t('placeholder')} autoFocus
              aria-label={t('placeholder')}
              className="w-full px-5 py-4 text-lg font-body border-4 border-black rounded-2xl bg-white text-black shadow-[6px_6px_0_#111] focus:outline-none placeholder-black/30"
            />
            {error && (
              <div className="space-y-2">
                <p className="text-center text-[#E8432D] font-body font-bold text-sm">{error}</p>
                {suggestions.length > 0 && (
                  <div className="text-center">
                    <p className="font-body text-xs text-fg-faint mb-2">{t('did_you_mean')}</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {suggestions.map(s => (
                        <button key={s} type="button" onClick={() => onSearch(s)}
                          className="font-body text-sm font-bold px-4 py-2 bg-[#F7C948] text-black border-2 border-black rounded-xl shadow-[2px_2px_0_#111] btn-press"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              type="submit" disabled={!value.trim()}
              className="w-full py-4 bg-[#E8432D] text-white font-display text-2xl border-4 border-black rounded-2xl shadow-[6px_6px_0_#111] btn-press disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('dive_btn')}
            </button>

            {/* Daily topic — elevated card button */}
            <button
              type="button" onClick={() => onSearch(dailyTopic)}
              className="w-full flex items-center gap-3 py-3 px-4 border-2 rounded-2xl btn-press group transition-colors"
              style={{ background: 'rgba(247,201,72,0.10)', borderColor: 'rgba(247,201,72,0.45)' }}
            >
              <span className="text-xl shrink-0">🔥</span>
              <div className="flex-1 text-left min-w-0">
                <p className="font-body text-[0.62rem] text-fg-faint uppercase tracking-widest leading-none mb-0.5">{t('daily_label')}</p>
                <p className="font-display text-base text-fg truncate">{dailyTopic}</p>
                <p className="font-body text-[0.62rem] leading-none mt-1" style={{ color: 'var(--yellow)', opacity: 0.85 }}>
                  🎯 {t('daily_goal_label')} <strong>{DAILY_GOAL.label}</strong>
                </p>
              </div>
              <span className="font-body text-sm text-fg-faint group-hover:text-[#F7C948] transition-colors shrink-0" aria-hidden>→</span>
            </button>
          </motion.form>

{likedTopics?.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="w-full z-10 mt-5"
            >
              <p className="font-body text-xs text-fg-faint text-center md:text-left mb-2 uppercase tracking-widest">
                {t('starred_label')}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
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
        </div>

        {/* RIGHT: Earth — desktop only */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hidden md:flex items-center justify-center flex-shrink-0 z-10"
        >
          <EarthWithGlow size={240} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Phase 2: Loading ─────────────────────────────────────────────────────────
function LoadingPhase() {
  const { t } = useLanguage();
  return (
    <motion.div
      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] gap-5"
    >
      <div className="relative">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          style={{ borderRadius: '50%', overflow: 'hidden', width: 80, height: 80 }}>
          <PixelEarth size={80} animate={false} />
        </motion.div>
        <motion.div
          className="absolute -right-7 bottom-1"
          animate={{ y: [0, -5, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PixelRabbit width={36} />
        </motion.div>
      </div>
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
function FactsPhase({ topicData, facts, cameo, onNext, onNewSearch, liked, onLike, images, loadingImages }) {
  const { lang, t } = useLanguage();
  const [detailLevel, setDetailLevel] = useState('some');
  const [fullIntro, setFullIntro]     = useState(null);
  const [loadingIntro, setLoadingIntro] = useState(false);

  // Lazy-fetch the full Wikipedia intro only when the user picks "I want to learn"
  useEffect(() => {
    if (detailLevel !== 'learn' || fullIntro !== null || loadingIntro) return;
    setLoadingIntro(true);
    fetchFullIntro(topicData.title, lang)
      .then(text => { setFullIntro(text); setLoadingIntro(false); })
      .catch(() => { setFullIntro(''); setLoadingIntro(false); });
  }, [detailLevel, fullIntro, loadingIntro, topicData.title, lang]);

  const paragraphs = detailLevel === 'learn'
    ? extractParagraphs(fullIntro ?? topicData.extract, 'learn')
    : [];

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
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer"
            className="font-body text-[9px] text-fg-faint/60 hover:text-fg-faint underline transition-colors text-center"
          >
            CC-BY-SA
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

        {/* Images — vertical column on desktop, horizontal scroll on mobile */}
        {(loadingImages || images.length > 0) && (
          <div className="md:w-56 lg:w-64 md:shrink-0">
            {loadingImages ? (
              <div className="overflow-x-auto md:overflow-visible pb-1 md:pb-0">
                <div className="flex md:flex-col gap-3 w-max md:w-auto">
                  {[180, 140].map((h, i) => (
                    <div key={i} className="card shadow-[4px_4px_0_#111] overflow-hidden animate-pulse shrink-0 md:shrink md:w-auto"
                      style={{ height: h, width: 160, background: 'rgba(0,0,0,0.06)' }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto md:overflow-visible pb-1 md:pb-0">
                <div className="flex md:flex-col gap-3 w-max md:w-auto">
                  {images.slice(0, 4).map((img, i) => (
                    <motion.div
                      key={img.url}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i }}
                      className="card shadow-[4px_4px_0_#111] overflow-hidden shrink-0 w-40 md:w-auto md:shrink"
                    >
                      <img src={img.url} alt={img.title}
                        className="w-full object-cover block"
                        style={{ maxHeight: '170px', height: '120px' }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT — Article paragraphs */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
              {topicData.thumbnail?.source && (
                <div className="card shadow-[6px_6px_0_#111] overflow-hidden h-52">
                  <img src={topicData.thumbnail.source} alt={topicData.title}
                    className="w-full h-full object-cover" />
                </div>
              )}

              <div className="card shadow-[6px_6px_0_#111] p-5 flex-1">
                <h2 className="font-display text-lg text-black mb-3">
                  {detailLevel === 'some' ? t('quick_facts') : t('about')}
                </h2>
                <AnimatePresence mode="wait">
                  {detailLevel === 'some' ? (
                    <motion.div key="some"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {facts.length > 0 ? (
                        <ul className="space-y-3">
                          {facts.map((fact, i) => (
                            <motion.li key={i}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.06 * i, duration: 0.3 }}
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
                    </motion.div>
                  ) : loadingIntro ? (
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
                    <motion.div key="learn"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {paragraphs.length > 0 ? (
                        <div className="space-y-3">
                          {paragraphs.map((para, i) => (
                            <motion.p key={i}
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

      {/* Cameo — map for geographic places, quote for persons */}
      {cameo?.type === 'map' && (
        <motion.a
          href={cameo.osmUrl} target="_blank" rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card shadow-[4px_4px_0_#111] overflow-hidden flex mb-5 hover:shadow-[6px_6px_0_#111] transition-shadow"
        >
          <img
            src={cameo.mapUrl} alt="Map"
            className="object-cover shrink-0"
            style={{ width: 130, height: 90 }}
            onError={e => { e.currentTarget.closest('a').style.display = 'none'; }}
          />
          <div className="px-4 flex flex-col justify-center gap-0.5">
            <p className="font-body text-[10px] text-black/40 uppercase tracking-widest">📍 OpenStreetMap</p>
            <p className="font-body text-sm text-black/70">View on the map ↗</p>
          </div>
        </motion.a>
      )}
      {cameo?.type === 'quote' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card shadow-[4px_4px_0_#111] p-4 mb-5"
        >
          <p className="font-body text-[10px] text-black/40 uppercase tracking-widest mb-2">💬 Wikiquote</p>
          <blockquote className="font-body text-sm text-black/70 italic leading-relaxed">
            &ldquo;{cameo.text}&rdquo;
          </blockquote>
          <p className="font-body text-[10px] text-black/40 mt-2 text-right">— {cameo.source}</p>
        </motion.div>
      )}

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

// ─── Trail strip ─────────────────────────────────────────────────────────────
const TrailStrip = memo(function TrailStrip({ chain, onBranch }) {
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
});

// ─── Phase 5: Swipe card ──────────────────────────────────────────────────────
function SwipeCard({ topic, topicIndex, total, depth, chain, onBranch, onSwipeRight, onSwipeLeft, onNewSearch, onDownvote }) {
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
      className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] px-4 py-8"
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

      <TrailStrip chain={chain} onBranch={onBranch} />

      <p className="font-display text-xl text-white mb-1">{t('related_card')}</p>
      <p className="font-body text-sm text-white/65 mb-5 tracking-wide">
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
          className="flex-1 py-3 font-display text-lg bg-[#F7C948] text-black border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
        >
          {t('dive_in')}
        </button>
      </div>

      <div className="flex items-center justify-center gap-5 mt-4">
        <button onClick={onNewSearch}
          className="font-body text-sm text-white/45 hover:text-white underline transition-colors"
        >
          {t('start_over')}
        </button>
        <span className="text-white/25 text-xs">·</span>
        <button
          onClick={() => { onDownvote(topic.title); onSwipeLeft(); }}
          className="font-body text-sm text-white/45 hover:text-[#E8432D] transition-colors flex items-center gap-1"
        >
          👎 {t('downvote_btn')}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Phase 6: Done ────────────────────────────────────────────────────────────
function DonePhase({ topic, chain, badge, onNewSearch, isDailySession, challengeOriginalDepth }) {
  const { t } = useLanguage();
  const n = chain.length;

  return (
    <motion.div
      key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px-4rem)] md:min-h-[calc(100dvh-60px)] px-4 text-center"
    >
      <div className="mb-5"><PixelRabbit width={100} /></div>

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

// ─── Root Home component ──────────────────────────────────────────────────────
export default function Home() {
  const [phase, setPhase]           = useState('input');
  const [error, setError]           = useState(null);
  const [topicData, setTopicData]   = useState(null);
  const [facts, setFacts]           = useState([]);
  const [related, setRelated]       = useState([]);
  const [relIdx, setRelIdx]         = useState(0);
  const [sharedTrail, setSharedTrail]   = useState(null);
  const [suggestions, setSuggestions]   = useState([]);
  const [cameo, setCameo]               = useState(null);
  const [images, setImages]             = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [chain, setChain]               = useState([]);
  const [isDailySession, setIsDailySession]           = useState(false);
  const [challengeOriginalDepth, setChallengeOriginalDepth] = useState(null);

  const { startSession, addToChain, isLiked, toggleLike, likedTopics } = useHistory();
  const { streak, recordDive, recordDepth }                             = useStreak();
  const { awardTrophy }                                                 = useTrophies();
  const { syncStats, recordDailyWin }                                   = useLeaderboard();
  const { lang, t }                                                      = useLanguage();
  const { downvote, isDownvoted }                                        = useDownvotes();

  const sessionRef    = useRef(null);
  const seenRef       = useRef(new Set());
  const chainRef      = useRef([]);
  const dimensionRef  = useRef(false);
  const dailyWonRef   = useRef(false);
  const factsTimerRef = useRef(null);
  const resetRef      = useRef(null);
  const searchIdRef   = useRef(0);

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const rawTrail = params.get('trail');
    if (rawTrail) {
      const trail = rawTrail.split('|')
        .map(s => { try { return decodeURIComponent(s); } catch { return ''; } })
        .filter(Boolean)
        .map(s => s.slice(0, 150));
      if (trail.length >= 2) {
        // Enough hops to show the challenge screen
        setSharedTrail(trail);
        setPhase('challenge');
      } else if (trail.length === 1) {
        setSharedTrail(trail);
      }
    }
    const q = params.get('q');
    if (q) {
      window.history.replaceState({}, '', window.location.pathname);
      runSearch(decodeURIComponent(q).slice(0, 150));
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
    const searchId = ++searchIdRef.current;
    setError(null);
    setSuggestions([]);
    setPhase('loading');
    try {
      const data = await searchTopic(query, lang);
      if (searchId !== searchIdRef.current) return;
      seenRef.current.add(data.title.toLowerCase());

      // Start image fetch immediately — runs in parallel with related fetch,
      // and results arrive before the user finishes the transition animation
      setLoadingImages(true);
      setImages([]);
      fetchArticleImages(data.title, lang)
        .then(imgs => { if (searchId === searchIdRef.current) { setImages(imgs); setLoadingImages(false); } })
        .catch(() => { if (searchId === searchIdRef.current) setLoadingImages(false); });

      const [f, allRel] = await Promise.all([
        Promise.resolve(extractFacts(data.extract)),
        fetchRelated(data.title, lang),
      ]);

      // Fire cameo fetch async — doesn't block phase transition
      fetchCameo(data, lang)
        .then(c => { if (searchId === searchIdRef.current) setCameo(c); })
        .catch(() => {});

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
        // Track if this fresh session started from today's daily topic
        const daily = getDailyTopic(lang);
        setIsDailySession(query.trim().toLowerCase() === daily.toLowerCase());
      }
      setChain([...chainRef.current]);

      const depth = chainRef.current.length;
      if (depth >= 5)  awardTrophy('hop_5');
      if (depth >= 10) awardTrophy('hop_10');
      if (depth >= 25) awardTrophy('hop_25');

      const daily = getDailyTopic(lang);
      if (data.title.toLowerCase().includes(daily.toLowerCase())) {
        awardTrophy('daily');
      }

      if (!continueSession && query.trim().toLowerCase() === 'down the rabbit hole') {
        awardTrophy('og_rabbit');
      }

      // Daily goal win detection
      if (continueSession && isDailySession && DAILY_GOAL.test(data.title) && !dailyWonRef.current && !hasWonToday()) {
        dailyWonRef.current = true;
        markWonToday();
        recordDailyWin();
        setPhase('daily_win');
        return;
      }

      const is50 = continueSession && depth === 50 && !dimensionRef.current;
      if (is50) {
        dimensionRef.current = true;
        awardTrophy('hop_50');
        awardTrophy('dimension');
        setPhase('dimension');
      } else if (localStorage.getItem('dth-skip-transition') === 'true') {
        setPhase('facts');
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
        const sug = await searchSuggestions(query, lang);
        setSuggestions(sug);
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
    dailyWonRef.current  = false;
    setPhase('input');
    setTopicData(null);
    setFacts([]);
    setRelated([]);
    setRelIdx(0);
    setError(null);
    setCameo(null);
    setImages([]);
    setLoadingImages(false);
    setChain([]);
    setSharedTrail(null);
    setIsDailySession(false);
    setChallengeOriginalDepth(null);
    sessionRef.current = null;
  };
  resetRef.current = reset;

  useEffect(() => {
    const h = () => resetRef.current?.();
    window.addEventListener('dth-go-home', h);
    return () => window.removeEventListener('dth-go-home', h);
  }, []);

  // Sync stats to leaderboard after each session (no-op if not signed in)
  useEffect(() => {
    if (streak.total > 0) syncStats(streak.current, streak.total);
  }, [streak.current, streak.total, syncStats]);

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
        {phase === 'challenge' && sharedTrail && (
          <ChallengePhase
            key="challenge"
            trail={sharedTrail}
            onAccept={() => {
              const depth = sharedTrail.length;
              const topic = sharedTrail[0];
              setChallengeOriginalDepth(depth);
              setSharedTrail(null);
              runSearch(topic);
            }}
            onContinue={() => {
              const topic = sharedTrail[sharedTrail.length - 1];
              setSharedTrail(null);
              setPhase('input');
              runSearch(topic);
            }}
            onDecline={() => {
              setSharedTrail(null);
              setPhase('input');
            }}
          />
        )}
        {phase === 'input' && (
          <InputPhase key="input" onSearch={q => runSearch(q)} error={error}
            suggestions={suggestions}
            sharedTrail={sharedTrail?.length === 1 ? sharedTrail : null}
            likedTopics={likedTopics} />
        )}
        {phase === 'loading'    && <LoadingPhase key="loading" />}
        {phase === 'dimension'  && <DimensionPhase key="dimension" onContinue={handleDimensionContinue} />}
        {phase === 'daily_win' && topicData && (
          <DailyChallengeWonPhase
            key="daily_win"
            topic={topicData.title}
            chain={chainRef.current}
            onContinue={() => {
              if (localStorage.getItem('dth-skip-transition') === 'true') {
                setPhase('facts');
              } else {
                setPhase('transition');
                advanceToFacts();
              }
            }}
          />
        )}
        {phase === 'transition' && <TransitionPhase key="transition" onSkip={() => {
          clearTimeout(factsTimerRef.current);
          setPhase('facts');
        }} />}
        {phase === 'facts' && topicData && (
          <FactsPhase key="facts" topicData={topicData} facts={facts} cameo={cameo}
            liked={isLiked(topicData.title)}
            onLike={() => toggleLike(topicData.title)}
            onNext={() => related.length ? setPhase('related') : goToDone()}
            onNewSearch={reset}
            images={images} loadingImages={loadingImages}
          />
        )}
        {phase === 'related' && related[relIdx] && (
          <SwipeCard key={`rel-${relIdx}`}
            topic={related[relIdx]} topicIndex={relIdx} total={related.length}
            depth={chainRef.current.length}
            chain={chain} onBranch={topic => runSearch(topic, false)}
            onSwipeRight={swipeRight} onSwipeLeft={swipeLeft} onNewSearch={reset}
            onDownvote={downvote}
          />
        )}
        {phase === 'done' && (
          <DonePhase key="done" topic={topicData?.title}
            chain={chainRef.current} badge={badge} onNewSearch={reset}
            isDailySession={isDailySession}
            challengeOriginalDepth={challengeOriginalDepth}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
