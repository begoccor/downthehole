import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuests } from '../../hooks/useQuests';

// Full weekly-quest list for the Burrow page.
export default function QuestPanel() {
  const { t } = useLanguage();
  const quests = useQuests();

  return (
    <div className="space-y-3">
      {quests.map(q => (
        <div key={q.id} className={`card shadow-[4px_4px_0_#111] p-4 flex items-center gap-4 ${q.done ? 'border-4 !border-[#66BB6A]' : ''}`}>
          <span className="text-3xl shrink-0">{q.done ? '✅' : q.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-body font-bold text-sm ${q.done ? 'text-black/45 line-through' : 'text-black'}`}>
              {t(`qn_${q.id}`)}
            </p>
            <div className="h-2.5 rounded-full mt-1.5 overflow-hidden bg-black/10">
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{ width: `${(q.progress / q.target) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ background: q.done ? '#66BB6A' : '#F7C948' }}
              />
            </div>
            <p className="font-body text-[11px] text-black/45 mt-1 tabular-nums">
              {q.progress} / {q.target}
            </p>
          </div>
          <span className="font-display text-base text-[#E8432D] shrink-0">+{q.reward} 🥕</span>
        </div>
      ))}
      <p className="font-body text-xs text-fg-faint text-center">{t('quests_reset')}</p>
    </div>
  );
}
