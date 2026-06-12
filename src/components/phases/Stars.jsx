import { memo } from 'react';
import { motion } from 'framer-motion';

const STAR_DATA = [
  { top: '6%',  left: '7%',  delay: 0,   dur: 7,  size: '2rem'   },
  { top: '10%', left: '84%', delay: 1.2, dur: 9,  size: '2.5rem' },
  { top: '22%', left: '3%',  delay: 2.8, dur: 6,  size: '1.2rem' },
  { top: '38%', left: '93%', delay: 0.5, dur: 8,  size: '1rem'   },
  { top: '55%', left: '5%',  delay: 3.1, dur: 7,  size: '2rem'   },
  { top: '68%', left: '90%', delay: 1.7, dur: 10, size: '1.5rem' },
  { top: '78%', left: '11%', delay: 2.3, dur: 6,  size: '1rem'   },
  { top: '85%', left: '77%', delay: 0.9, dur: 8,  size: '0.8rem' },
  { top: '92%', left: '44%', delay: 4,   dur: 7,  size: '1.2rem' },
  { top: '48%', left: '96%', delay: 1.5, dur: 9,  size: '1.5rem' },
  { top: '30%', left: '47%', delay: 5,   dur: 11, size: '0.7rem' },
  { top: '72%', left: '51%', delay: 2.6, dur: 8,  size: '0.8rem' },
];

const Stars = memo(function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {STAR_DATA.map((s, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{ top: s.top, left: s.left, color: 'var(--star)', fontSize: s.size }}
          animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 0.85, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
});

export default Stars;
