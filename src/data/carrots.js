// ─── Carrot soft currency ─────────────────────────────────────────────────────
// Earned by playing (daily wins, quests, creature meetings, depth milestones),
// spent only on cosmetics. Never purchasable with real money.

const KEY = 'dth-carrots';

export function getCarrots() {
  const n = parseInt(localStorage.getItem(KEY), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function set(n) {
  localStorage.setItem(KEY, String(Math.max(0, n)));
  window.dispatchEvent(new CustomEvent('dth-carrots-changed'));
}

// `reason` is an i18n key shown in the reward toast; pass null to stay silent.
export function earnCarrots(amount, reason = null) {
  if (amount <= 0) return getCarrots();
  const next = getCarrots() + amount;
  set(next);
  if (reason) {
    window.dispatchEvent(new CustomEvent('dth-reward', {
      detail: { type: 'carrot', amount, reason },
    }));
  }
  return next;
}

export function spendCarrots(amount) {
  const balance = getCarrots();
  if (amount > balance) return false;
  set(balance - amount);
  return true;
}
