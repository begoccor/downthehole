import { memo } from 'react';
import { motion } from 'framer-motion';
import PixelEarth from '../PixelEarth';

const EarthWithGlow = memo(function EarthWithGlow({ size = 200 }) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: 'radial-gradient(circle, rgba(232,67,45,0.22) 0%, rgba(247,201,72,0.10) 45%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.30))' }}
      >
        <PixelEarth size={size} />
      </motion.div>
    </div>
  );
});

export default EarthWithGlow;
