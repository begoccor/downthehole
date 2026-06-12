import { motion } from 'framer-motion';

// S=shell, D=dark ridge, E=eye, R=rock, _=transparent
const COLORS = { S: '#A1887F', D: '#6D4C41', E: '#FFE082', R: '#78909C', _: null };

const GRID = [
  '__DDDDDD__',
  '_DSSSSSSD_',
  '_DSESSES_D',
  '_DSSSSSSD_',
  '__DDDDDD__',
  '_DSSSSSSD_',
  '__DDDDDD__',
  '_DSSSSSSD_',
  '__DDDDDD__',
  '___RRRR___',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelTrilobite({ width = 60 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ x: [0, 2, -2, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
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
