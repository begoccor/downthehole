import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFullIntro } from '../../hooks/useWikipedia';
import { useLanguage } from '../../contexts/LanguageContext';
import DailyBanner from './DailyBanner';

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

export default function FactsPhase({ topicData, facts, cameo, onNext, onNewSearch, liked, onLike, images, loadingImages, dailyPuzzle, dailyHops }) {
  const { lang, t } = useLanguage();
  const [detailLevel, setDetailLevel] = useState('some');
  const [fullIntro, setFullIntro]     = useState(null);
  const [loadingIntro, setLoadingIntro] = useState(false);

  // Lazy-fetch the full Wikipedia intro only when the user picks "I want to learn"
  const selectDetailLevel = (id) => {
    setDetailLevel(id);
    if (id !== 'learn' || fullIntro !== null || loadingIntro) return;
    setLoadingIntro(true);
    fetchFullIntro(topicData.title, lang)
      .then(text => { setFullIntro(text); setLoadingIntro(false); })
      .catch(() => { setFullIntro(''); setLoadingIntro(false); });
  };

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
      {/* Daily puzzle banner */}
      {dailyPuzzle && (
        <div className="mb-4">
          <DailyBanner puzzle={dailyPuzzle} hops={dailyHops} />
        </div>
      )}

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
            onClick={() => selectDetailLevel(id)}
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
