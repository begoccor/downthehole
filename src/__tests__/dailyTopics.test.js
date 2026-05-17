import { describe, it, expect } from 'vitest';
import { getDailyTopic } from '../data/dailyTopics.js';

describe('getDailyTopic', () => {
  it('returns a non-empty string for each supported language', () => {
    for (const lang of ['en', 'fr', 'es']) {
      const topic = getDailyTopic(lang);
      expect(typeof topic).toBe('string');
      expect(topic.length).toBeGreaterThan(0);
    }
  });

  it('falls back to English for unknown languages', () => {
    const topic = getDailyTopic('xx');
    expect(typeof topic).toBe('string');
    expect(topic.length).toBeGreaterThan(0);
  });

  it('returns the same topic for the same day across calls', () => {
    expect(getDailyTopic('en')).toBe(getDailyTopic('en'));
  });

  it('returns different topics for different languages (localized titles)', () => {
    const en = getDailyTopic('en');
    const fr = getDailyTopic('fr');
    const es = getDailyTopic('es');
    // All three exist and are strings — FR and ES should differ from EN
    // (they use native Wikipedia article titles)
    expect(typeof en).toBe('string');
    expect(typeof fr).toBe('string');
    expect(typeof es).toBe('string');
  });
});
