import { motion } from 'framer-motion';

// B=dark brown, M=mid brown, N=pink nose, C=claw grey, E=eye, _=transparent
const COLORS = { B: '#4E342E', M: '#795548', N: '#F48FB1', C: '#90A4AE', E: '#1A1A2A', _: null };

const GRID = [
  '___BBBBB__',
  '__BMMMMBB_',
  '_BMMEMEMBM',
  '_BMMNMMBM_',
  'CBMMMMMMBC',
  'CBBBBBBBBC',
  '_CBBBBBBBC',
  '__BBBBB___',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelMole({ width = 60 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width} height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ y: [0, -4, 0], x: [0, 2, -2, 0] }}
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
