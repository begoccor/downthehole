import { motion } from 'framer-motion';

// C=crystal, c=light crystal, B=body rock, D=dark rock, E=eye, _=transparent
const COLORS = { C: '#7E57C2', c: '#B39DDB', B: '#546E7A', D: '#37474F', E: '#E1BEE7', _: null };

const GRID = [
  '___cC_____',
  '__CCCc____',
  '_DBBBBBD__',
  '_BEBBBEB__',
  '_BBBBBBB__',
  '_DBBBBBD_C',
  '__BBBBB_Cc',
  '_BB___BB_C',
  '_DB___BD__',
  '_DD___DD__',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelGolem({ width = 60 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
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
