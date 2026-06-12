import { GRID, COLS, ROWS, PRIDE_BOW, isPrideMonth, furColor } from '../data/rabbitSprite';

// `outfit` is an array of cosmetic items. Overlay items carry `pixels`
// ([[x, y, color]], optionally `behind`) drawn in the same grid space —
// negative y sits above the head, x may extend past the body; the svg expands
// to fit while the body keeps its size. Fur items recolor the body via
// `palette` (keys of the sprite COLORS) or the `rainbow` flag (row stripes).
export default function PixelRabbit({ width = 100, outfit = [] }) {
  const pride = isPrideMonth();
  const fur = outfit.find(item => item.palette || item.rainbow);
  const allPixels = [...outfit.flatMap(item => item.pixels ?? []), ...(pride ? PRIDE_BOW : [])];

  const minX = Math.min(0, ...allPixels.map(([x]) => x));
  const maxX = Math.max(COLS - 1, ...allPixels.map(([x]) => x));
  const minY = Math.min(0, ...allPixels.map(([, y]) => y));
  const maxY = Math.max(ROWS - 1, ...allPixels.map(([, y]) => y));
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  const pxSize    = width / COLS;
  const svgWidth  = Math.round(cols * pxSize);
  const svgHeight = Math.round(rows * pxSize);

  const renderItems = (behind) => outfit
    .filter(item => item.pixels && !!item.behind === behind)
    .flatMap((item, i) => item.pixels.map(([x, y, fill], j) => (
      <rect key={`o${behind ? 'b' : 'f'}-${i}-${j}`} x={x} y={y} width={1} height={1} fill={fill} />
    )));

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`${minX} ${minY} ${cols} ${rows}`}
      style={{ imageRendering: 'pixelated' }}
      aria-label="Pixel art rabbit"
    >
      {renderItems(true)}
      {GRID.flatMap((row, y) =>
        [...row].map((char, x) => {
          const fill = furColor(fur, char, y);
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
      {pride && PRIDE_BOW.map(([x, y, fill]) => (
        <rect key={`pride-${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
      ))}
      {renderItems(false)}
    </svg>
  );
}
