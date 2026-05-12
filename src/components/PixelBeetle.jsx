import { motion } from 'framer-motion';

// B=body, G=mid-green, L=light shell, E=white eyes, _=transparent
const COLORS = { B: '#166534', G: '#16a34a', L: '#4ade80', E: '#FFFFFF', _: null };

const GRID = [
  '___BBBBB__',
  '__BGGGGGB_',
  '_BGLLLSGB_',
  'BGLLLLLGB_',
  'BGLLLLLGB_',
  '_BGSSSSGB_',
  '__BBBBBBB_',
  '__B_____B_',
  '___B___B__',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelBeetle({ width = 56 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ x: [0, 3, -2, 0], rotate: [0, -5, 5, 0] }}
      transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
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
