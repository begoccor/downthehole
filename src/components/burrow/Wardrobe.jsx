import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCosmetics } from '../../hooks/useCosmetics';
import { useCarrots } from '../../hooks/useCarrots';
import { COSMETICS } from '../../data/cosmetics';
import { getTotalDailyWins } from '../../data/dailyPuzzle';
import { isAlbumComplete } from '../../data/creatures';
import PixelRabbit from '../PixelRabbit';

const SLOT_ICON = { fur: '🐰', hat: '🎩' };

// Achievement conditions for non-purchasable items.
function achievementMet(id) {
  if (id === 'daily_wins_10') return getTotalDailyWins() >= 10;
  if (id === 'album_complete') return isAlbumComplete();
  return false;
}

export default function Wardrobe() {
  const { t } = useLanguage();
  const { owned, equipped, buy, grant, equip, outfit } = useCosmetics();
  const { balance } = useCarrots();

  // Grant achievement cosmetics the moment their condition is met
  useEffect(() => {
    for (const item of COSMETICS) {
      if (item.unlock.achievement && !owned.includes(item.id) && achievementMet(item.unlock.achievement)) {
        grant(item.id);
      }
    }
  }, [owned, grant]);

  return (
    <div>
      {/* Live preview */}
      <div className="card shadow-[4px_4px_0_#111] p-5 mb-4 flex items-center justify-center gap-6"
        style={{ background: 'linear-gradient(180deg, #2A1A0E 0%, #1A0F08 100%)' }}>
        <PixelRabbit width={96} outfit={outfit} />
        <div className="text-center">
          <p className="font-display text-2xl text-[#F7C948]">{balance} 🥕</p>
          <p className="font-body text-xs text-white/50">{t('carrots_label')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {COSMETICS.map(item => {
          const isOwned    = owned.includes(item.id);
          const isEquipped = equipped[item.slot] === item.id;
          const cost       = item.unlock.cost;
          const locked     = item.unlock.achievement && !isOwned;

          return (
            <div key={item.id} className={`card shadow-[4px_4px_0_#111] p-3 flex flex-col items-center text-center gap-2 ${isEquipped ? 'border-4 !border-[#F7C948]' : ''}`}>
              <div style={locked ? { filter: 'grayscale(1) opacity(0.45)' } : undefined}>
                <PixelRabbit width={56} outfit={[item]} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm text-black leading-tight">
                  {SLOT_ICON[item.slot]} {t(`cos_${item.id}`)}
                </p>
              </div>

              {isOwned ? (
                <button
                  onClick={() => equip(item.slot, isEquipped ? null : item.id)}
                  className={`w-full py-1.5 font-body text-xs font-bold border-2 border-black rounded-xl btn-press ${
                    isEquipped ? 'bg-black text-white' : 'bg-[#F7C948] text-black shadow-[2px_2px_0_#111]'
                  }`}
                >
                  {isEquipped ? t('unequip') : t('equip')}
                </button>
              ) : locked ? (
                <p className="font-body text-[10px] text-black/45 leading-snug">
                  🔒 {item.unlock.achievement === 'daily_wins_10'
                    ? t('unlock_wins', { n: 10 })
                    : t('unlock_album')}
                </p>
              ) : (
                <button
                  onClick={() => buy(item.id)}
                  disabled={balance < cost}
                  className="w-full py-1.5 font-body text-xs font-bold bg-[#E8432D] text-white border-2 border-black rounded-xl shadow-[2px_2px_0_#111] btn-press disabled:opacity-40 disabled:cursor-not-allowed"
                  title={balance < cost ? t('need_more') : undefined}
                >
                  {t('buy_for', { n: cost })}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
