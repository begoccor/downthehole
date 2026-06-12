import { useState, useEffect, useCallback } from 'react';
import { COSMETICS, getCosmeticsState, saveCosmeticsState, getEquippedOutfit } from '../data/cosmetics';
import { spendCarrots } from '../data/carrots';

// Owned + equipped cosmetics, reactive across components.
export function useCosmetics() {
  const [state, setState] = useState(getCosmeticsState);

  useEffect(() => {
    const h = () => setState(getCosmeticsState());
    window.addEventListener('dth-cosmetics-changed', h);
    return () => window.removeEventListener('dth-cosmetics-changed', h);
  }, []);

  const buy = useCallback((id) => {
    const item = COSMETICS.find(c => c.id === id);
    const s = getCosmeticsState();
    if (!item || s.owned.includes(id) || item.unlock.cost == null) return false;
    if (!spendCarrots(item.unlock.cost)) return false;
    saveCosmeticsState({ ...s, owned: [...s.owned, id] });
    return true;
  }, []);

  // Achievement items become owned the moment their condition is met.
  const grant = useCallback((id) => {
    const s = getCosmeticsState();
    if (s.owned.includes(id)) return;
    saveCosmeticsState({ ...s, owned: [...s.owned, id] });
  }, []);

  const equip = useCallback((slot, id) => {
    const s = getCosmeticsState();
    const equipped = { ...s.equipped };
    if (id === null) delete equipped[slot];
    else if (s.owned.includes(id)) equipped[slot] = id;
    else return;
    saveCosmeticsState({ ...s, equipped });
  }, []);

  return { ...state, buy, grant, equip, outfit: getEquippedOutfit() };
}

// Lightweight read-only outfit for places that just render the rabbit.
export function useOutfit() {
  const [outfit, setOutfit] = useState(getEquippedOutfit);
  useEffect(() => {
    const h = () => setOutfit(getEquippedOutfit());
    window.addEventListener('dth-cosmetics-changed', h);
    return () => window.removeEventListener('dth-cosmetics-changed', h);
  }, []);
  return outfit;
}
