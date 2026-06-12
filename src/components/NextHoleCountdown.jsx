import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function msToMidnight() {
  const now  = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next - now;
}

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

// "Next hole in 07:42:13" — counts to local midnight, when the puzzle rotates.
export default function NextHoleCountdown({ className = '' }) {
  const { t } = useLanguage();
  const [ms, setMs] = useState(msToMidnight);

  useEffect(() => {
    const id = setInterval(() => setMs(msToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={`font-body text-sm ${className}`}>
      {t('next_hole_in')}{' '}
      <span className="font-display text-base tabular-nums tracking-wide">{fmt(ms)}</span>
    </p>
  );
}
