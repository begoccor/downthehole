import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SITE = 'https://www.followthehole.com';

function buildShareUrl(chain) {
  const encoded = chain.map(encodeURIComponent).join('|');
  return `${SITE}/?trail=${encoded}`;
}

// ─── Share image generator ────────────────────────────────────────────────────
async function generateShareImage(chain) {
  await document.fonts.ready;

  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Yellow background
  ctx.fillStyle = '#F7C948';
  ctx.fillRect(0, 0, W, H);

  // Card hard shadow
  const PAD = 56;
  ctx.fillStyle = '#111';
  ctx.fillRect(PAD + 10, PAD + 10, W - PAD * 2, H - PAD * 2);

  // White card
  ctx.fillStyle = '#fff';
  ctx.fillRect(PAD, PAD, W - PAD * 2, H - PAD * 2);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 8;
  ctx.strokeRect(PAD, PAD, W - PAD * 2, H - PAD * 2);

  // Yellow header bar
  const HDR = 148;
  ctx.fillStyle = '#F7C948';
  ctx.fillRect(PAD, PAD, W - PAD * 2, HDR);
  ctx.beginPath();
  ctx.moveTo(PAD, PAD + HDR);
  ctx.lineTo(W - PAD, PAD + HDR);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#0D0721';
  ctx.font = '72px "Lilita One"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FOLLOW THE HOLE', W / 2, PAD + HDR / 2);

  // Subtitle
  ctx.fillStyle = '#555';
  ctx.font = '38px "Nunito"';
  ctx.fillText('went down the rabbit hole', W / 2, PAD + HDR + 58);

  // Trail — cap at 5 visible items
  const items = chain.length > 5
    ? [chain[0], chain[1], '···', chain[chain.length - 2], chain[chain.length - 1]]
    : chain;

  const TRAIL_TOP  = PAD + HDR + 110;
  const TRAIL_BOT  = H - PAD - 120;
  const ITEM_H     = (TRAIL_BOT - TRAIL_TOP) / items.length;
  const PILL_H     = Math.min(ITEM_H * 0.62, 84);
  const MAX_PILL_W = W - PAD * 2 - 80;

  items.forEach((topic, i) => {
    const centerY = TRAIL_TOP + (i + 0.5) * ITEM_H;
    const isEllipsis = topic === '···';
    const isCurrent  = i === items.length - 1;

    // Downward arrow between items
    if (i > 0) {
      ctx.fillStyle = '#E8432D';
      ctx.font = '38px "Lilita One"';
      ctx.fillText('↓', W / 2, centerY - ITEM_H / 2 + 4);
    }

    if (isEllipsis) {
      ctx.fillStyle = '#bbb';
      ctx.font = '48px "Nunito"';
      ctx.fillText('···', W / 2, centerY + 6);
      return;
    }

    // Measure + truncate label
    ctx.font = `56px "Lilita One"`;
    let label = topic;
    while (label.length > 1 && ctx.measureText(label + '…').width > MAX_PILL_W - 60)
      label = label.slice(0, -1);
    if (label !== topic) label = label.slice(0, -1) + '…';

    const textW  = ctx.measureText(label).width;
    const pillW  = Math.min(textW + 72, MAX_PILL_W);
    const pillX  = W / 2 - pillW / 2;
    const pillY  = centerY - PILL_H / 2 + (i > 0 ? 8 : 0);

    // Shadow
    ctx.fillStyle = '#111';
    ctx.fillRect(pillX + 5, pillY + 5, pillW, PILL_H);
    // Fill
    ctx.fillStyle = isCurrent ? '#E8432D' : '#fff';
    ctx.fillRect(pillX, pillY, pillW, PILL_H);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    ctx.strokeRect(pillX, pillY, pillW, PILL_H);
    // Label
    ctx.fillStyle = isCurrent ? '#fff' : '#0D0721';
    ctx.fillText(label, W / 2, pillY + PILL_H / 2 + (i > 0 ? 8 : 0) + 3);
  });

  // Depth
  ctx.fillStyle = '#111';
  ctx.font = '700 40px "Nunito"';
  ctx.fillText(
    `${chain.length} hop${chain.length !== 1 ? 's' : ''} deep`,
    W / 2, H - PAD - 66
  );

  // URL
  ctx.fillStyle = '#aaa';
  ctx.font = '32px "Nunito"';
  ctx.fillText('followthehole.com', W / 2, H - PAD - 22);

  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(new File([blob], 'hole.png', { type: 'image/png' })), 'image/png')
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SocialShare({ chain, startTopic, compact = false, isDailySession = false, challengeOriginalDepth = null }) {
  const [igState, setIgState]   = useState('idle'); // 'idle' | 'loading' | 'done' | 'copied'
  const [fbCopied, setFbCopied] = useState(false);
  const { t } = useLanguage();

  const n = chain.length;
  const displayTrail = n > 5
    ? chain.slice(0, 3).join(' → ') + ' → … → ' + chain[n - 1]
    : chain.join(' → ');
  const shareText = isDailySession
    ? t('share_text_daily', { n, topic: startTopic })
    : challengeOriginalDepth != null
    ? t('share_text_challenge', { n })
    : n > 1
    ? t('share_text_multi', { n, trail: displayTrail })
    : t('share_text_single', { topic: startTopic });
  const shareUrl  = buildShareUrl(chain);

  const tweetUrl   = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const fbPostText = `${shareText}\n\n🌍 ${shareUrl}`;

  const shareToFacebook = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Follow The Hole', text: shareText, url: shareUrl }); }
      catch { /* cancelled */ }
      return;
    }
    navigator.clipboard.writeText(fbPostText).catch(() => {});
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => { setFbCopied(true); setTimeout(() => setFbCopied(false), 3000); }, 500);
  };

  const shareToInstagram = async () => {
    if (igState === 'loading') return;
    setIgState('loading');
    try {
      const file = await generateShareImage(chain);
      // Try native file sharing (iOS 15+, Android Chrome)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Follow The Hole', text: shareText });
        setIgState('done');
        setTimeout(() => setIgState('idle'), 2500);
        return;
      }
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
    // Fallback: copy text to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).catch(() => {});
    setIgState('copied');
    setTimeout(() => setIgState('idle'), 2000);
  };

  const igLabel = igState === 'loading' ? '…'
    : igState === 'done'    ? '✓'
    : igState === 'copied'  ? '✓'
    : null;

  const btnBase = compact
    ? 'w-9 h-9 flex items-center justify-center border-2 border-black rounded-xl btn-press text-white shrink-0'
    : 'w-14 h-14 flex items-center justify-center border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press text-white';

  const buttons = (
    <>
      <a href={tweetUrl} target="_blank" rel="noreferrer"
        className={`${btnBase} bg-black`} title={t('share_x_btn')}
      >
        <XIcon />
      </a>

      <div className="relative flex flex-col items-center">
        <button onClick={shareToFacebook} className={`${btnBase} bg-[#1877F2]`} title={t('share_fb_btn')}>
          <FbIcon />
        </button>
        <span
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-body text-[10px] font-bold text-black/70 bg-[#F7C948] border border-black rounded-md px-2 py-0.5 pointer-events-none transition-opacity duration-300"
          style={{ opacity: fbCopied ? 1 : 0 }}
        >
          Paste in your post!
        </span>
      </div>

      <button
        onClick={shareToInstagram}
        disabled={igState === 'loading'}
        className={`${btnBase} transition-opacity ${igState === 'loading' ? 'opacity-60' : ''}`}
        style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
        title={t('share_ig_btn')}
      >
        {igLabel
          ? <span className="text-sm font-bold">{igLabel}</span>
          : <IgIcon />
        }
      </button>
    </>
  );

  if (compact) {
    return (
      <div className="flex gap-2 items-center flex-wrap mt-3 pt-3 border-t border-black/10">
        <span className="font-body text-xs text-black/40 uppercase tracking-widest mr-1">
          {t('share_social')}
        </span>
        {buttons}
      </div>
    );
  }

  return <div className="flex gap-3 justify-center">{buttons}</div>;
}
