import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDailyPuzzle, getTodayResult } from '../../data/dailyPuzzle';
import { useQuests } from '../../hooks/useQuests';
import Stars from './Stars';
import EarthWithGlow from './EarthWithGlow';
import NextHoleCountdown from '../NextHoleCountdown';
import OArrow from '../OArrow';

const GRAIN_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E";

function DailyPuzzleCard({ onStartDaily }) {
  const { lang, t } = useLanguage();
  const puzzle = getDailyPuzzle(lang);
  const result = getTodayResult();

  if (result) {
    return (
      <div
        className="w-full flex items-center gap-3 py-3 px-4 border-2 rounded-2xl"
        style={{ background: 'rgba(247,201,72,0.10)', borderColor: 'rgba(247,201,72,0.45)' }}
      >
        <span className="text-xl shrink-0">✅</span>
        <div className="flex-1 text-left min-w-0">
          <p className="font-body text-[0.62rem] text-fg-faint uppercase tracking-widest leading-none mb-0.5">
            {t('daily_hole')} #{puzzle.hole}
          </p>
          <p className="font-display text-base text-fg truncate">
            {result.hops != null
              ? t('daily_solved_in', { n: result.hops })
              : t('daily_solved')}
          </p>
          <NextHoleCountdown className="text-fg-faint mt-0.5 !text-[0.7rem]" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button" onClick={() => onStartDaily(puzzle)}
      className="w-full flex items-center gap-3 py-3 px-4 border-2 rounded-2xl btn-press group transition-colors"
      style={{ background: 'rgba(247,201,72,0.10)', borderColor: 'rgba(247,201,72,0.45)' }}
    >
      <span className="text-xl shrink-0">🕳️</span>
      <div className="flex-1 text-left min-w-0">
        <p className="font-body text-[0.62rem] text-fg-faint uppercase tracking-widest leading-none mb-0.5">
          🔥 {t('daily_hole')} #{puzzle.hole} · {t('daily_par')} {puzzle.par}
        </p>
        <p className="font-display text-base text-fg truncate">
          {puzzle.start} <span className="text-fg-faint">→</span> 🎯 {puzzle.target.label}
        </p>
        <p className="font-body text-[0.62rem] leading-none mt-1" style={{ color: 'var(--yellow)', opacity: 0.85 }}>
          {t('daily_tagline')}
        </p>
      </div>
      <span className="font-body text-sm text-fg-faint group-hover:text-[#F7C948] transition-colors shrink-0" aria-hidden>→</span>
    </button>
  );
}

function QuestWidget() {
  const { t } = useLanguage();
  const quests = useQuests();

  return (
    <div className="w-full mt-4">
      <p className="font-body text-xs text-fg-faint uppercase tracking-widest mb-2 text-center md:text-left">
        {t('quests_title')}
      </p>
      <div className="flex flex-col gap-1.5">
        {quests.map(q => (
          <div key={q.id} className="flex items-center gap-2.5">
            <span className="text-sm shrink-0 w-5 text-center">{q.done ? '✅' : q.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className={`font-body text-xs truncate ${q.done ? 'text-fg-faint line-through' : 'text-fg-muted'}`}>
                  {t(`qn_${q.id}`)}
                </p>
                <p className="font-body text-[10px] text-fg-faint shrink-0 tabular-nums">
                  {q.progress}/{q.target} · {q.reward}🥕
                </p>
              </div>
              <div className="h-1.5 rounded-full mt-0.5 overflow-hidden" style={{ background: 'var(--nav-inactive-bg)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${(q.progress / q.target) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ background: q.done ? '#66BB6A' : 'var(--yellow)' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InputPhase({ onSearch, onStartDaily, error, suggestions = [], sharedTrail, likedTopics }) {
  const { t } = useLanguage();
  const [value, setValue] = useState('');

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

            <DailyPuzzleCard onStartDaily={onStartDaily} />
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="w-full max-w-md mx-auto md:mx-0 z-10"
          >
            <QuestWidget />
          </motion.div>

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
