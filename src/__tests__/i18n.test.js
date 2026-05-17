import { describe, it, expect } from 'vitest';
import { EN, FR, ES } from '../data/i18n.js';

const EN_KEYS = Object.keys(EN);

describe('i18n completeness', () => {
  it('FR has every key that EN has', () => {
    const missing = EN_KEYS.filter(k => !(k in FR));
    expect(missing).toEqual([]);
  });

  it('ES has every key that EN has', () => {
    const missing = EN_KEYS.filter(k => !(k in ES));
    expect(missing).toEqual([]);
  });

  it('no EN value is empty', () => {
    const empty = EN_KEYS.filter(k => !EN[k]);
    expect(empty).toEqual([]);
  });

  it('no FR value is empty', () => {
    const empty = EN_KEYS.filter(k => k in FR && !FR[k]);
    expect(empty).toEqual([]);
  });

  it('no ES value is empty', () => {
    const empty = EN_KEYS.filter(k => k in ES && !ES[k]);
    expect(empty).toEqual([]);
  });

  it('template variables in EN are present in FR and ES', () => {
    const varPattern = /\{(\w+)\}/g;
    for (const key of EN_KEYS) {
      const enVars = [...EN[key].matchAll(varPattern)].map(m => m[1]).sort();
      if (enVars.length === 0) continue;

      if (key in FR) {
        const frVars = [...FR[key].matchAll(varPattern)].map(m => m[1]).sort();
        expect(frVars, `FR["${key}"] missing template vars`).toEqual(enVars);
      }
      if (key in ES) {
        const esVars = [...ES[key].matchAll(varPattern)].map(m => m[1]).sort();
        expect(esVars, `ES["${key}"] missing template vars`).toEqual(enVars);
      }
    }
  });
});
