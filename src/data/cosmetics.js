// ─── Rabbit cosmetics ─────────────────────────────────────────────────────────
// Two kinds of items:
//  - fur: a full-body recolor via `palette` (overrides PixelRabbit's color
//    keys: W body, P outer ear, r inner ear, G paws, E eyes, N nose) or the
//    special `rainbow` flag (row-striped body). Reads clearly at any size.
//  - hat: pixel overlays drawn in PixelRabbit's grid space (negative y = above
//    the head).
// Unlock is either { cost } in carrots or { achievement } granted by a feat.

const px = (coords, color) => coords.map(([x, y]) => [x, y, color]);

export const COSMETICS = [
  // ── Furs ──
  {
    id: 'cocoa', slot: 'fur', unlock: { cost: 25 },
    palette: { P: '#8D6E63', r: '#D7CCC8', G: '#6D4C41' },
  },
  {
    id: 'midnight', slot: 'fur', unlock: { cost: 40 },
    palette: { W: '#3B3B47', P: '#2A2A35', r: '#FF8FAB', G: '#26262E', E: '#FFFFFF' },
  },
  {
    id: 'sakura', slot: 'fur', unlock: { cost: 40 },
    palette: { W: '#FFD9E8', P: '#FF6B9D', r: '#FFF0F5', G: '#F7A6C5', N: '#E8432D' },
  },
  {
    id: 'honey', slot: 'fur', unlock: { cost: 60 },
    palette: { W: '#FFE082', P: '#F7A14B', r: '#FFF3C4', G: '#E8B83A' },
  },
  {
    id: 'cosmic', slot: 'fur', unlock: { cost: 80 },
    palette: { W: '#4A3B6B', P: '#372B52', r: '#8E7CC3', G: '#372B52', E: '#FFD54F' },
    pixels: [
      ...px([[3, 5], [6, 7]], '#FFFFFF'),
      ...px([[6, 3], [2, 7]], '#EAD9FF'),
    ],
  },
  {
    id: 'rainbow', slot: 'fur', unlock: { cost: 120 },
    rainbow: true,
  },

  // ── Hats ──
  {
    id: 'miner', slot: 'hat', unlock: { cost: 30 },
    pixels: [
      ...px([[3, -1], [4, -1], [5, -1], [6, -1]], '#FFC107'),
      ...px([[2, 0], [3, 0], [6, 0], [7, 0]], '#FFC107'),
      ...px([[4, 0], [5, 0]], '#FFF59D'),
    ],
  },
  {
    id: 'tophat', slot: 'hat', unlock: { cost: 50 },
    pixels: [
      ...px([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]], '#212121'),
      ...px([[3, -3], [4, -3], [5, -3], [6, -3], [3, -2], [4, -2], [5, -2], [6, -2]], '#212121'),
      ...px([[3, -1], [4, -1], [5, -1], [6, -1]], '#E8432D'),
    ],
  },
  {
    id: 'wizard', slot: 'hat', unlock: { cost: 75 },
    pixels: [
      ...px([[2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], '#7C3AED'),
      ...px([[3, -1], [4, -1], [6, -1]], '#7C3AED'),
      ...px([[5, -1]], '#F7C948'),
      ...px([[4, -2], [5, -2]], '#7C3AED'),
      ...px([[4, -3]], '#5E35B1'),
    ],
  },
  {
    id: 'crown', slot: 'hat', unlock: { achievement: 'daily_wins_10' },
    pixels: [
      ...px([[2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], '#FFD700'),
      ...px([[2, -1], [4, -1], [5, -1], [7, -1]], '#FFD700'),
      ...px([[3, 0]], '#E8432D'),
      ...px([[6, 0]], '#1E88E5'),
    ],
  },
  {
    id: 'explorer', slot: 'hat', unlock: { achievement: 'album_complete' },
    pixels: [
      ...px([[1, 0], [2, 0], [7, 0], [8, 0]], '#C8A165'),
      ...px([[3, 0], [4, 0], [5, 0], [6, 0]], '#6D4C41'),
      ...px([[3, -1], [4, -1], [5, -1], [6, -1]], '#C8A165'),
    ],
  },
];

export const SLOTS = ['fur', 'hat'];

const KEY = 'dth-cosmetics';

export function getCosmeticsState() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return { owned: s?.owned ?? [], equipped: s?.equipped ?? {} };
  } catch {
    return { owned: [], equipped: {} };
  }
}

export function saveCosmeticsState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('dth-cosmetics-changed'));
}

// Resolved items for the currently equipped outfit — feed to PixelRabbit.
export function getEquippedOutfit() {
  const { equipped } = getCosmeticsState();
  return SLOTS
    .map(slot => COSMETICS.find(c => c.id === equipped[slot]))
    .filter(Boolean);
}
