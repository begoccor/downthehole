// ─── Earth layer background system ───────────────────────────────────────────
// Shared by the swipe phase background, depth badges, and the share grid.
export const LAYERS = [
  { depth: 0,  color: '#1B3A1A', emoji: '🟩', label: '🌱 Surface'           },
  { depth: 4,  color: '#6D4C41', emoji: '🟫', label: '🌿 Topsoil'           },
  { depth: 9,  color: '#4E342E', emoji: '🟫', label: '🌑 Deep soil'         },
  { depth: 16, color: '#37474F', emoji: '⬜', label: '💎 Rock layer'        },
  { depth: 25, color: '#7B2D00', emoji: '🟧', label: '🌋 Magma approach'    },
  { depth: 35, color: '#8B0000', emoji: '🟥', label: '🔥 Earth core'        },
  { depth: 50, color: '#1A0030', emoji: '🟪', label: '🌌 Another dimension' },
];

function layerAt(depth) {
  return [...LAYERS].reverse().find(l => depth >= l.depth) ?? LAYERS[0];
}

export function getLayerColor(depth) {
  return layerAt(depth).color;
}

export function getLayerLabel(depth) {
  return layerAt(depth).label;
}

export function getLayerEmoji(depth) {
  return layerAt(depth).emoji;
}

export function getDepthStyle(depth) {
  if (depth >= 35) return { bg: '#8B0000', text: '#FFD0D0', border: 'rgba(255,100,100,0.5)' };
  if (depth >= 25) return { bg: '#7B2D00', text: '#FFD0A0', border: 'rgba(255,150,50,0.5)'  };
  if (depth >= 16) return { bg: '#37474F', text: '#CFD8DC', border: 'rgba(150,200,220,0.4)' };
  if (depth >= 9)  return { bg: '#5D4037', text: '#FFCCBC', border: 'rgba(200,130,100,0.4)' };
  if (depth >= 5)  return { bg: '#F7C948', text: '#111111', border: 'rgba(0,0,0,0.3)'       };
  return               { bg: '#FFFFFF', text: '#111111', border: 'rgba(0,0,0,0.25)'      };
}
