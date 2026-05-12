import { useState, useEffect } from 'react';

// B = ocean blue, G = land green, L = lighter blue (highlight), _ = transparent
const COLORS = {
  B: '#3B8ED6',
  G: '#4CB86A',
  D: '#2E8B4A',
  L: '#72B8E8',
  _: null,
};

// 16×16 grid — 3 rotation frames
const FRAMES = [
  // Frame 1: Americas
  [
    '______BBBB______',
    '____BBBBBBBB____',
    '___BBBBBBBBBB___',
    '__BBBGBBBBBBBB__',
    '__BBGGGBBBBBBB__',
    '_BBBGGGBBBBBBBB_',
    '_BBBGGGGBBBBBBB_',
    '_BBBBGGGBBBGBBB_',
    '_BBBBBBBBBGGBBB_',
    '_BBBBBBBBGGBBBB_',
    '__BBBBBBBBBBB___',
    '__BBBBBBBBBB____',
    '___BBBBBBBB_____',
    '____BBBBBB______',
    '______BBB_______',
    '________________',
  ],
  // Frame 2: Atlantic / Europe-Africa
  [
    '______BBBB______',
    '____BBBBBBBB____',
    '___BBBBBBBBBB___',
    '__BBBBBBGBBBBB__',
    '__BBBBBGGBBBBB__',
    '_BBBBBBGGGBBBB__',
    '_BBBBBGGGBBBBB__',
    '_BBBBBGGGBBBBB__',
    '_BBBBBBGBBBBBB__',
    '_BBBBBBBGBBBBB__',
    '__BBBBBBBBBBB___',
    '__BBBBBBBBBB____',
    '___BBBBBBBB_____',
    '____BBBBBB______',
    '______BBB_______',
    '________________',
  ],
  // Frame 3: Asia / Pacific
  [
    '______BBBB______',
    '____BBBBBBBB____',
    '___BBBBBBBGGG___',
    '__BBBBBBBGGGGB__',
    '__BBBBBBGGGGBB__',
    '_BBBBBBBGGGGBB__',
    '_BBBBBBGGGGGB___',
    '_BBBBBBBGGGBB___',
    '_BBBBBBBBGGBB___',
    '_BBBBBBBBBGB____',
    '__BBBBBBBBBBB___',
    '__BBBBBBBBBB____',
    '___BBBBBBBB_____',
    '____BBBBBB______',
    '______BBB_______',
    '________________',
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
