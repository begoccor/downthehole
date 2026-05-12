import { useState, useCallback } from 'react';

const KEY = 'dth-downvotes';

function load() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
  catch { return new Set(); }
}

export function useDownvotes() {
  const [downvoted, setDownvoted] = useState(load);

  const downvote = useCallback((title) => {
    setDownvoted(prev => {
      const next = new Set(prev);
      next.add(title.toLowerCase());
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isDownvoted = useCallback((title) => downvoted.has(title.toLowerCase()), [downvoted]);

  return { downvote, isDownvoted };
}
