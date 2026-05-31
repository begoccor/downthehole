import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const APP_URL = 'https://www.followthehole.com';

export default function InviteFriends({ chain, dark = false }) {
  const { t } = useLanguage();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);

  const start = chain[0] ?? '';
  const end   = chain[chain.length - 1] ?? '';
  const n     = chain.length;
  const msg   = t('invite_msg', { start, end, n, url: APP_URL });

  const openEmail = (e) => {
    e.preventDefault();
    window.open(
      `mailto:${encodeURIComponent(email)}` +
      `?subject=${encodeURIComponent(t('invite_email_subject'))}` +
      `&body=${encodeURIComponent(msg)}`
    );
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  const nativeShare = async () => {
    try { await navigator.share({ title: 'Follow The Hole', text: msg }); }
    catch { /* cancelled or unsupported */ }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const labelCls = `font-body text-[10px] uppercase tracking-widest text-center ${dark ? 'text-white/35' : 'text-black/40'}`;
  const inputCls = `flex-1 min-w-0 px-3 py-2.5 font-body text-sm rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-[#E8432D] ${
    dark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/35'
         : 'bg-white border-black text-black placeholder:text-black/30'
  }`;
  const sendCls = `px-4 py-2.5 font-display text-sm bg-[#E8432D] text-white rounded-xl btn-press whitespace-nowrap border-2 ${
    dark ? 'border-[#E8432D] shadow-[2px_2px_0_rgba(0,0,0,0.35)]'
         : 'border-black shadow-[2px_2px_0_#111]'
  }`;
  const appsBtnCls = `w-full py-2.5 font-body font-bold text-sm rounded-xl border-2 btn-press flex items-center justify-center gap-2 ${
    dark ? 'bg-white/10 border-white/20 text-white'
         : 'bg-white border-black text-black shadow-[2px_2px_0_#111]'
  }`;

  return (
    <div className="w-full max-w-xs flex flex-col gap-3">
      <p className={labelCls}>{t('invite_title')}</p>

      <form onSubmit={openEmail} className="flex gap-2">
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder={t('invite_placeholder')} required
          className={inputCls}
        />
        <button type="submit" className={sendCls}>
          {sent ? '✓' : t('invite_send')}
        </button>
      </form>

      <button
        onClick={canShare
          ? nativeShare
          : () => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')}
        className={appsBtnCls}
      >
        📲 {t('invite_apps')}
      </button>
    </div>
  );
}
