import { useState, useEffect, useCallback } from 'react';
import { getCarrots, spendCarrots as spend } from '../data/carrots';

// Reactive carrot balance — re-reads whenever any code earns or spends.
export function useCarrots() {
  const [balance, setBalance] = useState(getCarrots);

  useEffect(() => {
    const h = () => setBalance(getCarrots());
    window.addEventListener('dth-carrots-changed', h);
    return () => window.removeEventListener('dth-carrots-changed', h);
  }, []);

  const spendCarrots = useCallback((amount) => spend(amount), []);

  return { balance, spendCarrots };
}
