import { useState, useEffect } from 'react';

// B = ocean, G = land green, L = highlight blue, _ = transparent
const COLORS = {
  B: '#3B8ED6',
  G: '#4CB86A',
  D: '#2E8B4A',
  L: '#72B8E8',
  _: null,
};

// Symmetric 16×16 circle (r≈8.5, center 7.5,7.5)
// Row widths: 4,8,10,12,14,14,16,16,16,16,14,14,12,10,8,4
// Frame rotation: Americas → Europe/Africa → Asia
const FRAMES = [
  // Frame 1 — Americas
  [
    '______BBBB______',
    '____LBGBBBBB____',
    '___LBBGGBBBBB___',
    '__LBBGGGBBBBBB__',
    '_LBBBGGGBBBBBBB_',
    '_BBBGGGBBBBBBBB_',
    'BBGGGGBBBBBBBBBB',
    'BBBGGGBBBBBBBBBB',
    'BBBBBGBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '_BBBBGBBBBBBBBB_',
    '_BBBGGGBBBBBBBB_',
    '__BBGGGBBBBBBB__',
    '___BBGBBBBBBB___',
    '____BGBBBBBB____',
    '______GBBB______',
  ],
  // Frame 2 — Europe + Africa
  [
    '______BBBB______',
    '____LBBBBBBB____',
    '___LBBBGGBBBB___',
    '__LBBBGGGGBBBB__',
    '_LBBBBGGGGBBBBB_',
    '_BBBBBBGGGBBBBB_',
    'BBBBBGGGGGGBBBBB',
    'BBBBBGGGGGGGBBBB',
    'BBBBBGGGGGGBBBBB',
    'BBBBBGGGGGBBBBBB',
    '_BBBBGGGGGBBBBB_',
    '_BBBBBGGGGBBBBB_',
    '__BBBBGGGBBBBB__',
    '___BBBBGGBBBB___',
    '____BBBBBBBB____',
    '______BBBB______',
  ],
  // Frame 3 — Asia / Pacific
  [
    '______BBBB______',
    '____LBBBBBGG____',
    '___LBBBBBBGGG___',
    '__LBBBBBBGGGGB__',
    '_LBBBBBBBGGGGBB_',
    '_BBBBBBBGGGBBBB_',
    'BBBBBBBBBGGGBBBB',
    'BBBBBBBBBBGBBBBB',
    'BBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBB',
    '_BBBBBBBBBBBBBB_',
    '_BBBBBBBBBBBBBB_',
    '__BBBBBBBBBBBB__',
    '___BBBBBBBBBB___',
    '____BBBBBBBB____',
    '______BBBB______',
  ],
];

export default function PixelEarth({ size = 200, animate = true }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setFrame(f => (f + 1) % FRAMES.length), 750);
    return () => clearInterval(id);
  }, [animate]);

  const grid = FRAMES[frame];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
      aria-label="Pixel art Earth"
    >
      {grid.flatMap((row, y) =>
        [...row].map((char, x) => {
          const fill = COLORS[char];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </svg>
  );
}
