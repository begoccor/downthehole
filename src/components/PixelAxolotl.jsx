import { motion } from 'framer-motion';

// G=golden body, g=light belly, P=gill frills, E=eye, M=mouth, _=transparent
const COLORS = { G: '#FFC93C', g: '#FFE082', P: '#FF8FAB', E: '#2D2D2D', M: '#E8432D', _: null };

const GRID = [
  '_P______P_',
  'PGP____PGP',
  '_GGGGGGGG_',
  'PGEGGGGEGP',
  '_GGGGGGGG_',
  '_GgMMMMgG_',
  '__GGGGGG__',
  '___GGGGGG_',
  '____GGGGGG',
  '______GGG_',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelAxolotl({ width = 60 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 0 6px rgba(255,201,60,0.7))' }}
      aria-hidden
      animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {GRID.flatMap((row, y) =>
        [...row].map((char, x) => {
          const fill = COLORS[char];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </motion.svg>
  );
}
