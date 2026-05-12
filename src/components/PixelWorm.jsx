import { motion } from 'framer-motion';

// P=body, D=dark segment, E=eye, W=highlight, _=transparent
const COLORS = { P: '#FCA5A5', D: '#F87171', E: '#2D2D3D', W: '#FFEAEA', _: null };

const GRID = [
  '__PPPPPP__',
  '_PPWWWWPP_',
  '_PP_EE_PP_',
  '_PPWWWWPP_',
  '__PPPPPP__',
  '__PDDDDP__',
  '__PPPPPP__',
  '__PDDDDP__',
  '__PPPPPP__',
  '___PPPP___',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelWorm({ width = 60 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ y: [0, -3, 0], rotate: [0, 4, -4, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
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
