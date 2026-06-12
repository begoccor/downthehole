import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { searchTopic, fetchRelated, fetchCameo, fetchArticleImages, extractFacts, searchSuggestions } from '../hooks/useWikipedia';
import { useDownvotes } from '../hooks/useDownvotes';
import { useHistory } from '../hooks/useHistory';
import { useStreak, getDepthBadge } from '../hooks/useStreak';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useDailyStats } from '../hooks/useDailyStats';
import { useTrophies } from '../contexts/TrophyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getDailyPuzzle, hasWonToday, recordDailyResult } from '../data/dailyPuzzle';
import { getLayerColor } from '../data/layers';
import { earnCarrots } from '../data/carrots';
import { recordQuestEvent } from '../data/quests';
import { CREATURES, rollSessionSpawns, recordCreatureMeeting } from '../data/creatures';

import InputPhase from '../components/phases/InputPhase';
import LoadingPhase from '../components/phases/LoadingPhase';
import TransitionPhase from '../components/phases/TransitionPhase';
import FactsPhase from '../components/phases/FactsPhase';
import SwipeCard from '../components/phases/SwipeCard';
import DonePhase from '../components/phases/DonePhase';
import ChallengePhase from '../components/phases/ChallengePhase';
import DimensionPhase from '../components/phases/DimensionPhase';
import DailyWinPhase from '../components/phases/DailyWinPhase';

// Carrot payouts for depth milestones, once per session
const DEPTH_REWARDS = [
  { depth: 10, amount: 5 },
  { depth: 25, amount: 10 },
  { depth: 50, amount: 25 },
];

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
  const [activeDaily, setActiveDaily]   = useState(null);
  const [dailyWon, setDailyWon]         = useState(false);
  const [rareSpawns, setRareSpawns]     = useState([]);
  const [challengeOriginalDepth, setChallengeOriginalDepth] = useState(null);

  const { startSession, addToChain, isLiked, toggleLike, likedTopics } = useHistory();
  const { streak, recordDive, recordDepth }                             = useStreak();
  const { awardTrophy }                                                 = useTrophies();
  const { syncStats, recordDailyWin }                                   = useLeaderboard();
  const { submitDailyResult }                                           = useDailyStats();
  const { lang, t }                                                      = useLanguage();
  const { downvote, isDownvoted }                                        = useDownvotes();

  const sessionRef    = useRef(null);
  const seenRef       = useRef(new Set());
  const chainRef      = useRef([]);
  const dailyRef      = useRef(null);
  const dimensionRef  = useRef(false);
  const dailyWonRef   = useRef(false);
  const factsTimerRef = useRef(null);
  const resetRef      = useRef(null);
  const searchIdRef   = useRef(0);
  const spawnsRef     = useRef({});
  const metRef        = useRef(new Set());
  const milestonesRef = useRef(new Set());

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

  const setDaily = (puzzle) => {
    dailyRef.current = puzzle;
    setActiveDaily(puzzle);
  };

  const advanceToFacts = () => {
    factsTimerRef.current = setTimeout(() => setPhase('facts'), 2100);
  };

  const goToDone = () => {
    recordDepth(chainRef.current.length);
    setPhase('done');
  };

  // Creatures whose depth condition is met this session — record first sights
  const checkCreatures = (depth) => {
    for (const c of CREATURES) {
      if (depth < c.minDepth || !spawnsRef.current[c.id] || metRef.current.has(c.id)) continue;
      metRef.current.add(c.id);
      recordCreatureMeeting(c.id);
    }
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
        recordQuestEvent('hops');
      } else {
        sessionRef.current = startSession(data.title);
        chainRef.current   = [data.title];
        spawnsRef.current  = rollSessionSpawns();
        setRareSpawns(CREATURES.filter(c => c.chance < 1 && spawnsRef.current[c.id]).map(c => c.id));
        metRef.current     = new Set();
        milestonesRef.current = new Set();
        recordDive();
        awardTrophy('first_dive');
        recordQuestEvent('session');
        // A fresh session starting from today's puzzle start counts as a daily run
        const puzzle = getDailyPuzzle(lang);
        setDaily(query.trim().toLowerCase() === puzzle.start.toLowerCase() ? puzzle : null);
      }
      setChain([...chainRef.current]);

      const depth = chainRef.current.length;
      if (depth >= 5)  awardTrophy('hop_5');
      if (depth >= 10) awardTrophy('hop_10');
      if (depth >= 25) awardTrophy('hop_25');
      recordQuestEvent('depth', depth);
      checkCreatures(depth);

      for (const { depth: d, amount } of DEPTH_REWARDS) {
        if (depth >= d && !milestonesRef.current.has(d)) {
          milestonesRef.current.add(d);
          earnCarrots(amount, 'reward_depth');
        }
      }

      if (!continueSession && query.trim().toLowerCase() === 'down the rabbit hole') {
        awardTrophy('og_rabbit');
      }

      // Daily puzzle win detection
      const daily = dailyRef.current;
      if (continueSession && daily && daily.target.test.test(data.title)
          && !dailyWonRef.current && !hasWonToday()) {
        dailyWonRef.current = true;
        setDailyWon(true);
        const hops = depth - 1;
        recordDailyResult(hops);
        awardTrophy('daily');
        earnCarrots(10 + (hops <= daily.par ? 5 : 0), 'reward_daily');
        recordQuestEvent('daily_win');
        recordDailyWin();
        submitDailyResult(hops);
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
    spawnsRef.current    = {};
    metRef.current       = new Set();
    milestonesRef.current = new Set();
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
    setDaily(null);
    setDailyWon(false);
    setRareSpawns([]);
    setChallengeOriginalDepth(null);
    sessionRef.current = null;
  };

  useEffect(() => {
    resetRef.current = reset;
  });

  useEffect(() => {
    const h = () => resetRef.current?.();
    window.addEventListener('dth-go-home', h);
    return () => window.removeEventListener('dth-go-home', h);
  }, []);

  // Sync stats to leaderboard after each session (no-op if not signed in)
  useEffect(() => {
    if (streak.total > 0) syncStats(streak.current, streak.total);
  }, [streak.current, streak.total, syncStats]);

  const handleLike = (title) => {
    if (!isLiked(title)) recordQuestEvent('star');
    toggleLike(title);
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

  const badge = getDepthBadge(chain.length);

  const layerColor  = getLayerColor(chain.length);
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
            onStartDaily={puzzle => { setDaily(puzzle); runSearch(puzzle.start); }}
            suggestions={suggestions}
            sharedTrail={sharedTrail?.length === 1 ? sharedTrail : null}
            likedTopics={likedTopics} />
        )}
        {phase === 'loading'    && <LoadingPhase key="loading" />}
        {phase === 'dimension'  && <DimensionPhase key="dimension" onContinue={handleDimensionContinue} />}
        {phase === 'daily_win' && topicData && activeDaily && (
          <DailyWinPhase
            key="daily_win"
            puzzle={activeDaily}
            chain={chain}
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
            onLike={() => handleLike(topicData.title)}
            onNext={() => related.length ? setPhase('related') : goToDone()}
            onNewSearch={reset}
            images={images} loadingImages={loadingImages}
            dailyPuzzle={!dailyWon ? activeDaily : null}
            dailyHops={Math.max(0, chain.length - 1)}
          />
        )}
        {phase === 'related' && related[relIdx] && (
          <SwipeCard key={`rel-${relIdx}`}
            topic={related[relIdx]} topicIndex={relIdx} total={related.length}
            depth={chain.length}
            chain={chain} onBranch={topic => runSearch(topic, false)}
            upcoming={related.slice(relIdx + 1, relIdx + 3)}
            justDove={relIdx === 0 && chain.length > 1}
            rareSpawns={rareSpawns}
            dailyPuzzle={!dailyWon ? activeDaily : null}
            onSwipeRight={swipeRight} onSwipeLeft={swipeLeft} onNewSearch={reset}
            onDownvote={downvote}
          />
        )}
        {phase === 'done' && (
          <DonePhase key="done" topic={topicData?.title}
            chain={chain} badge={badge} onNewSearch={reset}
            isDailySession={activeDaily != null}
            challengeOriginalDepth={challengeOriginalDepth}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
