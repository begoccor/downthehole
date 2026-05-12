import { motion } from 'framer-motion';

// S=body, E=red eye, L=leg, _=transparent
const COLORS = { S: '#212121', E: '#E53935', L: '#424242', _: null };

const GRID = [
  'L___SSSS__L',
  'LL_SSSSSSLL',
  'LSSEEESSSSL',
  '_SSSSSSSSS_',
  'LSSSSSSSSLL',
  'LL________L',
  'L__________',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelSpider({ width = 66 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width} height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ y: [0, -5, 2, 0], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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
