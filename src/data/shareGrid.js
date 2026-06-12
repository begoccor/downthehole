import { getLayerEmoji } from './layers';

const MAX_SQUARES = 12;

// One square per hop, colored by the layer you were at on that hop.
// Depth progresses 1, 2, 3… so the grid is fully determined by the hop count.
export function buildShareGrid(hops) {
  const shown = Math.min(hops, MAX_SQUARES);
  let grid = '';
  for (let depth = 1; depth <= shown; depth++) grid += getLayerEmoji(depth);
  if (hops > MAX_SQUARES) grid += `+${hops - MAX_SQUARES}`;
  return grid + '🏁';
}

// Wordle-style spoiler-free result block. The target is always replaced by 🎯.
export function buildShareText({ hole, start, hops, par, hopWord = 'hops' }) {
  return [
    `Down The H⬤LE #${hole}`,
    `${start} → 🎯`,
    `${buildShareGrid(hops)} ${hops} ${hopWord} · Par ${par}`,
    'followthehole.com',
  ].join('\n');
}
