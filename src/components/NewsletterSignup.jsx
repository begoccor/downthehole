import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FORM_ACTION =
  'https://b1ed02d0.sibforms.com/serve/MUIFALFc2McGvK5ABgT_rSjH1ukQG15d92psBx3eIIoOLmfIGI2zx53Vd4S2oIjM9jKgiS1b--JBojSlO0J3mLzGI-0RL3M4KgMmfbNWlCRfbMOXplNDyH6XD1FzKWL3v948KU7CZq4iXDeslpe5toBMTU0_1Ujji5nCo_2JJI5puUcYoW4dsMzSb5ZVmW0juccZP8UCnSgcvWVQ4Q==';

export default function NewsletterSignup({ className = '' }) {
  const { lang } = useLanguage();
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(FORM_ACTION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        EMAIL: email,
        email_address_check: '',
        locale: lang,
        html_type: 'simple',
      }).toString(),
      mode: 'no-cors',
    }).catch(() => {});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`card shadow-[4px_4px_0_#111] p-4 text-center ${className}`}>
        <p className="font-display text-xl text-[#E8432D]">You&rsquo;re in! 🐰</p>
        <p className="font-body text-sm text-black/50 mt-1">Weekly rabbit holes, straight to your inbox.</p>
      </div>
    );
  }

  return (
    <div className={`card shadow-[4px_4px_0_#111] p-4 ${className}`}>
      <p className="font-body text-xs text-black/50 uppercase tracking-widest mb-3">
        📬 Weekly rabbit holes in your inbox
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 px-3 py-2 font-body text-sm border-2 border-black rounded-xl bg-white text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#E8432D]"
        />
        <button
          type="submit"
          className="px-4 py-2 font-display text-sm bg-[#E8432D] text-white border-2 border-black rounded-xl shadow-[2px_2px_0_#111] btn-press whitespace-nowrap"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}
