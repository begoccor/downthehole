// ─── Daily challenge win condition ───────────────────────────────────────────
// Change DAILY_GOAL to update the daily challenge target at any time.
export const DAILY_GOAL = {
  label: 'Philosophy',
  // \b = word boundary: matches "Philosophy", "Political philosophy", "Philosophy of science"
  // but not "Philosopher" or "Philosophical"
  test: (title) => /\bphilosophy\b/i.test(title),
};

const KEY = 'dth-daily-win';

export function hasWonToday() {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(KEY) === today;
}

export function markWonToday() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(KEY, today);
}
