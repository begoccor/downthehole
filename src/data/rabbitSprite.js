// ─── Rabbit sprite data ───────────────────────────────────────────────────────
// Shared by the PixelRabbit component and the canvas share-image generator.
// W = cream body, P = outer ear pink, r = inner ear blush, E = dark eye,
// N = nose pink, G = grey paw, _ = transparent
export const COLORS = {
  W: '#F8F0E8',
  P: '#FF8FAB',
  r: '#FFB3C6',
  E: '#2D2D2D',
  N: '#FF6B9D',
  G: '#C0B8B0',
  _: null,
};

// 10 cols × 10 rows — front-facing friendly rabbit
export const GRID = [
  '_PP___PP__',
  '_PrP_PrP__',
  '__PP__PP__',
  '__WWWWWW__',
  '_WEWWWWEW_',
  '_WWWWWWWW_',
  '_WWWNWWWW_',
  '_WWWWWWWW_',
  '__GWWWWG__',
  '___GGGG___',
];

export const COLS = GRID[0].length;
export const ROWS = GRID.length;

// Pride month (June): a little rainbow bow tied around the tip of the right
// ear. Two 2×2 loops and a deep-magenta knot (▮▮_▮▮ / ▮▮█▮▮) — the knot sits
// on the ear tip itself so the bow reads as attached, and the loops run
// red→yellow and green→purple so all six stripes show as diagonals.
// Drawn under the outfit layer so hats sit naturally over it.
export const PRIDE_BOW = [
  [5, -1, '#E8432D'], [6, -1, '#F7A14B'], [8, -1, '#66BB6A'], [9, -1, '#64B5F6'],
  [5, 0, '#F7A14B'], [6, 0, '#F7C948'], [7, 0, '#D81B60'],
  [8, 0, '#64B5F6'], [9, 0, '#AB7BE3'],
];

export const isPrideMonth = () => new Date().getMonth() === 5;

// Row-striped body for the rainbow fur — eyes and nose keep their base colors.
const RAINBOW_ROWS = ['#E8432D', '#F7A14B', '#F7C948', '#66BB6A', '#42A5F5', '#5C6BC0', '#AB7BE3'];

export function furColor(fur, char, y) {
  if (char === '_') return null;
  if (fur?.rainbow && char !== 'E' && char !== 'N') {
    return RAINBOW_ROWS[Math.min(RAINBOW_ROWS.length - 1, Math.floor((y * RAINBOW_ROWS.length) / ROWS))];
  }
  return fur?.palette?.[char] ?? COLORS[char];
}

// Fully resolved pixel list (back-to-front) for drawing the dressed rabbit
// outside React — e.g. onto the share-image canvas.
export function getRabbitPixels(outfit = []) {
  const fur = outfit.find(item => item.palette || item.rainbow);
  const pixels = [];
  outfit.filter(i => i.pixels && i.behind).forEach(i => pixels.push(...i.pixels));
  GRID.forEach((row, y) => [...row].forEach((char, x) => {
    const fill = furColor(fur, char, y);
    if (fill) pixels.push([x, y, fill]);
  }));
  if (isPrideMonth()) pixels.push(...PRIDE_BOW);
  outfit.filter(i => i.pixels && !i.behind).forEach(i => pixels.push(...i.pixels));
  return pixels;
}
