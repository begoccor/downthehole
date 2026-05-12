import { motion } from 'framer-motion';

// C=body, A=lighter segment, L=leg, H=head, E=eyes, _=transparent
const COLORS = { C: '#BF360C', A: '#FF7043', L: '#E64A19', H: '#D84315', E: '#FFECB3', _: null };

const GRID = [
  'L_L_L_L_L_L_',
  'HCACACACACAC',
  'HCACACACACAC',
  'HCACACACACAC',
  'L_L_L_L_L_L_',
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelCentipede({ width = 80 }) {
  const height = Math.round(width * ROWS / COLS);
  return (
    <motion.svg
      width={width} height={height}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden
      animate={{ x: [0, 6, -4, 2, 0], scaleX: [1, 1.04, 0.97, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
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
