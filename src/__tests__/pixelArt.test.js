import { describe, it, expect } from 'vitest';

// Inline the grids to avoid importing JSX components
const RABBIT_GRID = [
  '_PP___PP__',
  '_PrP_PrP__',
  '__PP__PP__',
  '__WWWWWW__',
  '_WEWWWWEW_',
  '_WWWWWWWW_',
  '_WWWNWWWW_',
  '_WWWWWWWW_',
  '__GWWWWG__',
  '___GGGG___',
];

const EARTH_FRAMES = [
  // Frame 1 — Americas
  ['______BBBB______','____LBGBBBBB____','___LBBGGBBBBB___','__LBBGGGBBBBBB__','_LBBBGGGBBBBBBB_','_BBBGGGBBBBBBBB_','BBGGGGBBBBBBBBBB','BBBGGGBBBBBBBBBB','BBBBBGBBBBBBBBBB','BBBBBBBBBBBBBBBB','_BBBBGBBBBBBBBB_','_BBBGGGBBBBBBBB_','__BBGGGBBBBBBB__','___BBGBBBBBBB___','____BGBBBBBB____','______GBBB______'],
  // Frame 2 — Europe + Africa
  ['______BBBB______','____LBBBBBBB____','___LBBBGGBBBB___','__LBBBGGGGBBBB__','_LBBBBGGGGBBBBB_','_BBBBBBGGGBBBBB_','BBBBBGGGGGGBBBBB','BBBBBGGGGGGGBBBB','BBBBBGGGGGGBBBBB','BBBBBGGGGGBBBBBB','_BBBBGGGGGBBBBB_','_BBBBBGGGGBBBBB_','__BBBBGGGBBBBB__','___BBBBGGBBBB___','____BBBBBBBB____','______BBBB______'],
  // Frame 3 — Asia / Pacific
  ['______BBBB______','____LBBBBBGG____','___LBBBBBBGGG___','__LBBBBBBGGGGB__','_LBBBBBBBGGGGBB_','_BBBBBBBGGGBBBB_','BBBBBBBBBGGGBBBB','BBBBBBBBBBGBBBBB','BBBBBBBBBBBBBBBB','BBBBBBBBBBBBBBBB','_BBBBBBBBBBBBBB_','_BBBBBBBBBBBBBB_','__BBBBBBBBBBBB__','___BBBBBBBBBB___','____BBBBBBBB____','______BBBB______'],
];

describe('PixelRabbit grid integrity', () => {
  const COLS = RABBIT_GRID[0].length;
  const ROWS = RABBIT_GRID.length;

  it('has 10 rows', () => expect(ROWS).toBe(10));
  it('has 10 columns', () => expect(COLS).toBe(10));

  it('every row is exactly 10 characters', () => {
    RABBIT_GRID.forEach((row, i) => {
      expect(row.length, `Row ${i} has wrong length`).toBe(10);
    });
  });

  it('only uses valid color keys', () => {
    const VALID = new Set(['W', 'P', 'r', 'E', 'N', 'G', '_']);
    RABBIT_GRID.forEach((row, i) => {
      [...row].forEach((char, j) => {
        expect(VALID.has(char), `Row ${i} col ${j}: invalid char "${char}"`).toBe(true);
      });
    });
  });
});

describe('PixelEarth frames integrity', () => {
  it('has 3 frames', () => expect(EARTH_FRAMES).toHaveLength(3));

  EARTH_FRAMES.forEach((frame, f) => {
    it(`frame ${f + 1} has 16 rows`, () => expect(frame).toHaveLength(16));

    it(`frame ${f + 1} every row is exactly 16 characters`, () => {
      frame.forEach((row, i) => {
        expect(row.length, `Frame ${f + 1} row ${i} has wrong length`).toBe(16);
      });
    });

    it(`frame ${f + 1} only uses valid color keys`, () => {
      const VALID = new Set(['B', 'G', 'D', 'L', '_']);
      frame.forEach((row, i) => {
        [...row].forEach((char, j) => {
          expect(VALID.has(char), `Frame ${f + 1} row ${i} col ${j}: invalid char "${char}"`).toBe(true);
        });
      });
    });
  });
});
