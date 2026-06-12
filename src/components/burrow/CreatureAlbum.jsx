import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CREATURES, getCreatureLog } from '../../data/creatures';
import PixelWorm from '../PixelWorm';
import PixelBeetle from '../PixelBeetle';
import PixelMole from '../PixelMole';
import PixelCentipede from '../PixelCentipede';
import PixelSpider from '../PixelSpider';
import PixelTrilobite from '../PixelTrilobite';
import PixelGolem from '../PixelGolem';
import PixelAxolotl from '../PixelAxolotl';

const SPRITES = {
  worm:      PixelWorm,
  beetle:    PixelBeetle,
  mole:      PixelMole,
  centipede: PixelCentipede,
  spider:    PixelSpider,
  trilobite: PixelTrilobite,
  golem:     PixelGolem,
  axolotl:   PixelAxolotl,
};

const RARITY_COLOR = {
  common:    'text-black/40',
  rare:      'text-blue-600',
  legendary: 'text-yellow-600',
};

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreatureAlbum() {
  const { t } = useLanguage();
  const [log, setLog] = useState(getCreatureLog);

  useEffect(() => {
    const h = () => setLog(getCreatureLog());
    window.addEventListener('dth-creatures-changed', h);
    return () => window.removeEventListener('dth-creatures-changed', h);
  }, []);

  const metCount = CREATURES.filter(c => log[c.id]).length;

  return (
    <div>
      <p className="font-body text-sm text-fg-muted mb-3">
        {t('creatures_progress', { a: metCount, b: CREATURES.length })}
        {metCount === CREATURES.length && <span className="ml-2 font-bold text-[#E8432D]">{t('album_complete')}</span>}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CREATURES.map(c => {
          const Sprite = SPRITES[c.id];
          const met = log[c.id];
          return (
            <div key={c.id} className={`card shadow-[4px_4px_0_#111] p-3 flex flex-col items-center text-center gap-1.5 ${!met ? 'opacity-80' : ''}`}>
              <div className="h-16 flex items-center justify-center" style={!met ? { filter: 'brightness(0) opacity(0.25)' } : undefined}>
                <Sprite width={52} />
              </div>
              <p className="font-display text-sm text-black leading-tight">
                {met ? t(`cr_${c.id}_name`) : t('creature_hidden')}
              </p>
              <p className={`font-body text-[9px] uppercase tracking-widest ${RARITY_COLOR[c.rarity]}`}>
                {t(`rarity_${c.rarity}`)}
              </p>
              {met ? (
                <>
                  <p className="font-body text-[10px] text-black/55 leading-snug">{t(`cr_${c.id}_flavor`)}</p>
                  <p className="font-body text-[9px] text-black/35">
                    {t('first_met')} {fmt(met.firstMet)} · {t('seen_times', { n: met.timesSeen })}
                  </p>
                </>
              ) : (
                <p className="font-body text-[10px] text-black/40">
                  {t('creature_hint_depth', { d: c.minDepth })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
