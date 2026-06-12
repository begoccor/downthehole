import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

// Pixel-style bar chart of today's global hop distribution, with the player's
// own bar highlighted. Buckets cap at 12+ to stay compact.
const MAX_BUCKET = 12;

export default function DailyHistogram({ distribution, myHops }) {
  const { t } = useLanguage();

  const buckets = Array.from({ length: MAX_BUCKET }, (_, i) => ({ hops: i + 1, n: 0 }));
  for (const { hops, n } of distribution) {
    const idx = Math.min(hops, MAX_BUCKET) - 1;
    if (idx >= 0) buckets[idx].n += n;
  }
  const max = Math.max(1, ...buckets.map(b => b.n));
  const myBucket = Math.min(myHops, MAX_BUCKET);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1 h-20">
        {buckets.map(({ hops, n }, i) => {
          const isMe = hops === myBucket;
          return (
            <div key={hops} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(n > 0 ? 8 : 2, (n / max) * 100)}%` }}
                transition={{ delay: 0.04 * i, duration: 0.35, ease: 'easeOut' }}
                className="w-full rounded-t-sm"
                style={{
                  background: isMe ? '#F7C948' : 'rgba(255,255,255,0.22)',
                  boxShadow: isMe ? '0 0 8px rgba(247,201,72,0.6)' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1 mt-1">
        {buckets.map(({ hops }) => (
          <span
            key={hops}
            className="flex-1 text-center font-body text-[9px] leading-none"
            style={{ color: hops === myBucket ? '#F7C948' : 'rgba(255,255,255,0.35)' }}
          >
            {hops === MAX_BUCKET ? `${MAX_BUCKET}+` : hops}
          </span>
        ))}
      </div>
      {myHops != null && (
        <p className="font-body text-[10px] text-center mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('board_you').replace(/[()]/g, '') /* reuse "(you)" label */} → {myHops}
        </p>
      )}
    </div>
  );
}
