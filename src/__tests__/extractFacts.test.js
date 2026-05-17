import { describe, it, expect } from 'vitest';
import { extractFacts } from '../hooks/useWikipedia.js';

describe('extractFacts', () => {
  it('returns empty array for empty input', () => {
    expect(extractFacts('')).toEqual([]);
    expect(extractFacts(null)).toEqual([]);
    expect(extractFacts(undefined)).toEqual([]);
  });

  it('splits on sentence boundaries and trims', () => {
    const text = 'The octopus is a soft-bodied mollusc. It has eight limbs. It is highly intelligent.';
    const facts = extractFacts(text);
    expect(facts.length).toBeGreaterThan(0);
    facts.forEach(f => expect(f.endsWith('.')).toBe(true));
  });

  it('filters out sentences shorter than 35 chars', () => {
    const text = 'Short. ' + 'A'.repeat(40) + ' this is a longer sentence that should pass the filter.';
    const facts = extractFacts(text);
    facts.forEach(f => expect(f.length).toBeGreaterThanOrEqual(35));
  });

  it('filters out sentences longer than 300 chars', () => {
    const longSentence = 'A'.repeat(301) + '. Normal sentence that is long enough to be included here.';
    const facts = extractFacts(longSentence);
    facts.forEach(f => expect(f.length).toBeLessThanOrEqual(300 + 1)); // +1 for added period
  });

  it('returns at most 5 facts', () => {
    const text = Array.from({ length: 10 }, (_, i) =>
      `This is fact number ${i + 1} and it is long enough to be included in the result set.`
    ).join(' ');
    expect(extractFacts(text).length).toBeLessThanOrEqual(5);
  });

  it('strips short parentheticals', () => {
    const text = 'The Eiffel Tower (French: Tour Eiffel) is a wrought-iron lattice tower on the Champ de Mars in Paris.';
    const facts = extractFacts(text);
    expect(facts.join(' ')).not.toMatch(/\(French:/);
  });

  it('ensures every fact ends with a period', () => {
    const text = 'The sun is a star! It is approximately 4.6 billion years old. Life on Earth depends on it';
    const facts = extractFacts(text);
    facts.forEach(f => expect(f).toMatch(/\.$/));
  });
});
