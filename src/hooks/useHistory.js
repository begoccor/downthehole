import { useState, useCallback } from 'react';

const KEY       = 'dth-rabbit-holes';
const LIKES_KEY = 'dth-likes';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}
function persist(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

function loadLikes() {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES_KEY)) ?? []); }
  catch { return new Set(); }
}
function persistLikes(set) { localStorage.setItem(LIKES_KEY, JSON.stringify([...set])); }

export function useHistory() {
  const [history, setHistory]         = useState(load);
  const [likedTopics, setLikedTopics] = useState(loadLikes);

  const startSession = useCallback((startTopic) => {
    const session = {
      id: crypto.randomUUID(),
      startTopic,
      timestamp: new Date().toISOString(),
      chain: [startTopic],
    };
    setHistory(prev => {
      const next = [session, ...prev].slice(0, 50);
      persist(next);
      return next;
    });
    return session.id;
  }, []);

  const addToChain = useCallback((sessionId, topic) => {
    setHistory(prev => {
      const next = prev.map(s =>
        s.id === sessionId ? { ...s, chain: [...s.chain, topic] } : s
      );
      persist(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY);
    setHistory([]);
  }, []);

  const toggleLike = useCallback((title) => {
    setLikedTopics(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      persistLikes(next);
      return next;
    });
  }, []);

  const isLiked = useCallback((title) => likedTopics.has(title), [likedTopics]);

  return { history, startSession, addToChain, clearHistory, likedTopics, toggleLike, isLiked };
}
