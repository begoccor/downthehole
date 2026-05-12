import { createContext, useContext, useState, useCallback } from 'react';
import { EN, FR } from '../data/i18n';

const Ctx = createContext(null);
export const useLanguage = () => useContext(Ctx);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('dth-lang') || 'en'
  );

  const toggleLang = useCallback(() => {
    setLang(l => {
      const next = l === 'en' ? 'fr' : 'en';
      localStorage.setItem('dth-lang', next);
      return next;
    });
  }, []);

  const t = useCallback((key, vars = {}) => {
    const dict = lang === 'fr' ? FR : EN;
    let str = dict[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
    return str;
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, toggleLang, t }}>
      {children}
    </Ctx.Provider>
  );
}
