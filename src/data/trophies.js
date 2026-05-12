export const TROPHIES = [
  { id: 'first_dive', emoji: '🕳️', name: 'First Hole',       desc: 'Complete your first dive',               rarity: 'common'    },
  { id: 'hop_5',      emoji: '🐰', name: 'Rabbit',            desc: 'Reach 5 hops in one session',            rarity: 'common'    },
  { id: 'hop_10',     emoji: '🌌', name: 'Void Walker',       desc: 'Reach 10 hops in one session',           rarity: 'rare'      },
  { id: 'hop_25',     emoji: '🌋', name: 'Earth Digger',      desc: 'Reach the earth\'s core (25 hops)',      rarity: 'epic'      },
  { id: 'hop_50',     emoji: '⚫', name: 'Black Hole',        desc: 'Break through reality at 50 hops',       rarity: 'legendary' },
  { id: 'dimension',  emoji: '🌈', name: 'Dimensionaut',      desc: 'Survive another dimension',              rarity: 'legendary' },
  { id: 'streak_3',   emoji: '🔥', name: 'On Fire',           desc: '3-day diving streak',                   rarity: 'common'    },
  { id: 'streak_7',   emoji: '⚡', name: 'Weekly Obsessive',  desc: '7-day diving streak',                   rarity: 'rare'      },
  { id: 'streak_30',  emoji: '💎', name: 'Chronic Curiosity', desc: '30-day diving streak',                  rarity: 'legendary' },
  { id: 'total_10',   emoji: '🌍', name: 'Globe Trotter',     desc: 'Complete 10 total sessions',            rarity: 'common'    },
  { id: 'total_50',   emoji: '📚', name: 'Encyclopaedist',    desc: 'Complete 50 total sessions',            rarity: 'rare'      },
  { id: 'starred_5',  emoji: '⭐', name: 'Curator',           desc: 'Star 5 topics',                         rarity: 'rare'      },
  { id: 'daily',      emoji: '🌅', name: 'Daily Ritualist',   desc: 'Complete today\'s hole',                rarity: 'common'    },
  { id: 'og_rabbit',  emoji: '🐇', name: 'The O.G.',           desc: 'Down the original rabbit hole',          rarity: 'epic'      },
];

export const RARITY_STYLES = {
  common:    { border: 'border-black/20',  bg: 'bg-white',         text: 'text-black',         glow: '' },
  rare:      { border: 'border-blue-400',  bg: 'bg-blue-50',       text: 'text-blue-700',      glow: 'shadow-[0_0_12px_rgba(96,165,250,0.4)]' },
  epic:      { border: 'border-purple-500', bg: 'bg-purple-50',    text: 'text-purple-700',    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-50',   text: 'text-yellow-700',    glow: 'shadow-[0_0_16px_rgba(251,191,36,0.6)]' },
};
