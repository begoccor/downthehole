import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOutfit } from '../../hooks/useCosmetics';
import { getRabbitPixels } from '../../data/rabbitSprite';

const SITE_URL = 'followthehole.com';

// ─── Trainer-card share image ─────────────────────────────────────────────────
// 1080×1080: brand header, the player's dressed pixel rabbit front and center,
// four comic-style stat cards, and a challenge CTA.
async function generateBurrowImage({ pixels, stats, cta }) {
  await document.fonts.ready;

  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Dark background
  ctx.fillStyle = '#0D0721';
  ctx.fillRect(0, 0, W, H);

  // Red header band (matches the trail share image)
  const HDR = 204;
  ctx.fillStyle = '#E8432D';
  ctx.fillRect(0, 0, W, HDR);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, HDR, W, 8);

  ctx.font = '96px serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('🕳️', 56, HDR / 2 + 4);

  ctx.fillStyle = '#ffffff';
  ctx.font = '68px "Lilita One"';
  ctx.fillText('FOLLOW THE HOLE', 196, HDR / 2 - 20);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '34px "Nunito"';
  ctx.fillText('Fall in. Come out smarter.', 196, HDR / 2 + 34);

  // Ambient sparkles
  ctx.fillStyle = 'rgba(247,201,72,0.5)';
  ctx.font = '40px serif';
  ctx.textAlign = 'center';
  [[150, 330], [930, 380], [110, 600], [970, 620], [220, 700]].forEach(([x, y]) => {
    ctx.fillText('✦', x, y);
  });

  // The rabbit, pixel-perfect, centered above the stat row
  const xs = pixels.map(p => p[0]);
  const ys = pixels.map(p => p[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const cols = Math.max(...xs) - minX + 1;
  const rows = Math.max(...ys) - minY + 1;
  const PX = 34;
  const rabbitX = (W - cols * PX) / 2;
  const rabbitY = 660 - rows * PX;

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(W / 2, 672, cols * PX * 0.42, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  pixels.forEach(([x, y, fill]) => {
    ctx.fillStyle = fill;
    ctx.fillRect(rabbitX + (x - minX) * PX, rabbitY + (y - minY) * PX, PX, PX);
  });

  // Stat cards — comic style: offset shadow, white fill, thick border
  const CARD_W = 228, CARD_H = 158, GAP = 22;
  const startX = (W - (CARD_W * 4 + GAP * 3)) / 2;
  const cardY = 724;
  stats.forEach(({ value, label }, i) => {
    const cx = startX + i * (CARD_W + GAP);
    ctx.fillStyle = '#111';
    ctx.fillRect(cx + 8, cardY + 8, CARD_W, CARD_H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx, cardY, CARD_W, CARD_H);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 6;
    ctx.strokeRect(cx + 3, cardY + 3, CARD_W - 6, CARD_H - 6);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#E8432D';
    ctx.font = '58px "Lilita One"';
    ctx.fillText(String(value), cx + CARD_W / 2, cardY + 78);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '700 24px "Nunito"';
    ctx.fillText(label, cx + CARD_W / 2, cardY + 124);
  });

  // CTA strip
  const CTA_Y = 936;
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, CTA_Y, W, H - CTA_Y);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, CTA_Y, W, 3);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '54px "Lilita One"';
  ctx.fillText(cta, W / 2, CTA_Y + 74);
  ctx.fillStyle = '#E8432D';
  ctx.font = '700 38px "Nunito"';
  ctx.fillText(SITE_URL, W / 2, CTA_Y + 126);

  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(new File([blob], 'burrow.png', { type: 'image/png' })), 'image/png')
  );
}

// ─── Share button ─────────────────────────────────────────────────────────────
export default function ShareBurrow({ deepest, streak, trophies, trophiesTotal, dailyWins }) {
  const { t } = useLanguage();
  const outfit = useOutfit();
  const [state, setState] = useState('idle'); // idle | loading | done

  const shareText = t('share_text_burrow', { deepest, streak, trophies });

  const share = async () => {
    if (state === 'loading') return;
    setState('loading');
    try {
      const file = await generateBurrowImage({
        pixels: getRabbitPixels(outfit),
        stats: [
          { value: deepest,                        label: t('stat_deepest') },
          { value: `${streak}d`,                   label: t('stat_streak') },
          { value: `${trophies}/${trophiesTotal}`, label: t('trophies_title') },
          { value: dailyWins,                      label: t('board_tab_wins') },
        ],
        cta: t('burrow_share_cta'),
      });

      // Native file share (mobile) → fallback: download + copy text
      let shared = false;
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Follow The Hole', text: shareText });
          shared = true;
        } catch (e) {
          if (e.name === 'AbortError') { setState('idle'); return; } // user closed the sheet
        }
      }
      if (!shared) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-burrow.png';
        a.click();
        URL.revokeObjectURL(url);
        navigator.clipboard?.writeText(shareText).catch(() => {});
      }
      setState('done');
    } catch {
      setState('idle');
      return;
    }
    setTimeout(() => setState('idle'), 2500);
  };

  return (
    <button
      onClick={share}
      disabled={state === 'loading'}
      className="w-full py-3 mb-8 font-display text-lg bg-[#F7C948] text-black border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press disabled:opacity-60"
    >
      {state === 'loading' ? '…' : state === 'done' ? t('burrow_share_saved') : t('burrow_share')}
    </button>
  );
}
