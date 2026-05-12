// W = cream body, P = outer ear pink, r = inner ear blush, E = dark eye,
// N = nose pink, G = grey paw, _ = transparent
const COLORS = {
  W: '#F8F0E8',
  P: '#FF8FAB',
  r: '#FFB3C6',
  E: '#2D2D2D',
  N: '#FF6B9D',
  G: '#C0B8B0',
  _: null,
};

// 10 cols × 10 rows — front-facing friendly rabbit
const GRID = [
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

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelRabbit({ width = 100 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-label="Pixel art rabbit"
    >
      {GRID.flatMap((row, y) =>
        [...row].map((char, x) => {
          const fill = COLORS[char];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </svg>
  );
}
