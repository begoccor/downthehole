import { createContext, useContext, useState, useCallback } from 'react';
import { EN, FR, ES } from '../data/i18n';

const DICTS = { en: EN, fr: FR, es: ES };

const Ctx = createContext(null);
export const useLanguage = () => useContext(Ctx);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('dth-lang') || 'en'
  );

  const setLang = useCallback((newLang) => {
    if (!DICTS[newLang]) return;
    setLangState(newLang);
    localStorage.setItem('dth-lang', newLang);
  }, []);

  const t = useCallback((key, vars = {}) => {
    const dict = DICTS[lang] ?? EN;
    let str = dict[key] ?? EN[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
    return str;
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t }}>
      {children}
    </Ctx.Provider>
  );
}
