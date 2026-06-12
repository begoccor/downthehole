import { useState, useEffect } from 'react';
import { getActiveQuests, getQuestProgress } from '../data/quests';

// Reactive view of this week's quests + progress for widgets and the Burrow.
export function useQuests() {
  const [quests, setQuests] = useState(() => merge());

  useEffect(() => {
    const h = () => setQuests(merge());
    window.addEventListener('dth-quests-changed', h);
    return () => window.removeEventListener('dth-quests-changed', h);
  }, []);

  return quests;
}

function merge() {
  const progress = getQuestProgress();
  return getActiveQuests().map(q => ({
    ...q,
    progress: Math.min(progress[q.id]?.progress ?? 0, q.target),
    done:     progress[q.id]?.done ?? false,
  }));
}
