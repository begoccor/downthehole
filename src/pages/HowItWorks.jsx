import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const STEP_EMOJIS = ['🌍', '⬇️', '👈 👉', '🐰'];

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = STEP_EMOJIS.map((emoji, i) => ({
    emoji,
    label: t(`step_${i}_label`),
    title: t(`step_${i}_title`),
    desc:  t(`step_${i}_desc`),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-[clamp(2.8rem,10vw,5rem)] text-fg leading-none mb-3">
          {t('how_title')}
        </h1>
        <p className="font-body text-xl text-fg-muted">{t('how_sub')}</p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-4 mb-10">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i }}
            className="card shadow-[6px_6px_0_#111] p-5 flex gap-5 items-start"
          >
            <span className="text-5xl leading-none shrink-0">{step.emoji}</span>
            <div>
              <p className="font-body text-xs text-black/40 uppercase tracking-widest mb-0.5">{step.label}</p>
              <h3 className="font-display text-2xl text-[#E8432D] mb-1">{step.title}</h3>
              <p className="font-body text-base text-black/65 leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add to Home Screen */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-10"
      >
        <h2 className="font-display text-3xl text-fg mb-1">{t('homescreen_title')}</h2>
        <p className="font-body text-base text-fg-muted mb-4">{t('homescreen_sub')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { titleKey: 'homescreen_ios_title', steps: ['homescreen_ios_1','homescreen_ios_2','homescreen_ios_3','homescreen_ios_4'] },
            { titleKey: 'homescreen_android_title', steps: ['homescreen_android_1','homescreen_android_2','homescreen_android_3','homescreen_android_4'] },
          ].map(({ titleKey, steps }) => (
            <div key={titleKey} className="card shadow-[6px_6px_0_#111] p-5">
              <p className="font-display text-xl text-[#E8432D] mb-3">{t(titleKey)}</p>
              <ol className="space-y-1.5">
                {steps.map((key, i) => (
                  <li key={key} className="font-body text-sm text-black/70 flex gap-2">
                    <span className="font-display text-[#E8432D] shrink-0">{i + 1}.</span>
                    {t(key)}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#E8432D] border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0_#111] text-center"
      >
        <p className="font-display text-3xl text-fg mb-2">{t('how_ready')}</p>
        <p className="font-body text-base text-fg/75 mb-6">{t('how_waiting')}</p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#F7C948] text-black font-display text-xl border-4 border-black rounded-2xl shadow-[4px_4px_0_#111] btn-press"
        >
          {t('start_exploring')}
        </Link>
      </motion.div>

      {/* Contact */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center font-body text-sm text-fg-faint mt-8"
      >
        {t('contact_line')}{' '}
        <a
          href="mailto:contact@followthehole.com"
          className="text-fg-muted underline underline-offset-2 hover:text-fg transition-colors"
        >
          contact@followthehole.com
        </a>
      </motion.p>
    </div>
  );
}
