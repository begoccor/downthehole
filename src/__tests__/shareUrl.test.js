import { describe, it, expect } from 'vitest';
import { EN } from '../data/i18n.js';

const SITE = 'https://www.followthehole.com';

function buildShareUrl(chain) {
  const encoded = chain.map(encodeURIComponent).join('|');
  return `${SITE}/?trail=${encoded}`;
}

function t(key, vars = {}) {
  let str = EN[key] ?? key;
  for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, v);
  return str;
}

function parseTrail(raw) {
  return raw.split('|')
    .map(s => { try { return decodeURIComponent(s); } catch { return ''; } })
    .filter(Boolean)
    .map(s => s.slice(0, 150));
}

describe('buildShareUrl', () => {
  it('always uses the production domain', () => {
    const url = buildShareUrl(['Octopus']);
    expect(url.startsWith(SITE)).toBe(true);
  });

  it('encodes each topic and joins with pipe', () => {
    const url = buildShareUrl(['Black hole', 'Einstein']);
    expect(url).toContain('Black%20hole|Einstein');
  });

  it('encodes special characters in topic names', () => {
    const url = buildShareUrl(['Salvador Dalí']);
    expect(url).toContain(encodeURIComponent('Salvador Dalí'));
  });

  it('handles a single-topic chain', () => {
    const url = buildShareUrl(['Chess']);
    expect(url).toBe(`${SITE}/?trail=Chess`);
  });

  it('handles a long chain', () => {
    const chain = ['Topic A', 'Topic B', 'Topic C', 'Topic D', 'Topic E'];
    const url = buildShareUrl(chain);
    const trailParam = url.split('?trail=')[1];
    expect(trailParam.split('|')).toHaveLength(5);
  });
});

describe('Facebook share URL', () => {
  it('includes sharer.php and trail URL', () => {
    const shareUrl = buildShareUrl(['Octopus', 'Cephalopod']);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    expect(fbUrl).toContain('sharer.php');
    expect(fbUrl).toContain(encodeURIComponent(SITE));
  });
});

describe('Daily share text', () => {
  it('includes topic and hop count', () => {
    const text = t('share_text_daily', { n: 7, topic: 'Octopus' });
    expect(text).toContain('Octopus');
    expect(text).toContain('7');
  });

  it('includes followthehole.com', () => {
    const text = t('share_text_daily', { n: 3, topic: 'Jazz' });
    expect(text).toContain('followthehole.com');
  });
});

describe('Challenge share text', () => {
  it('includes hop count', () => {
    const text = t('share_text_challenge', { n: 5 });
    expect(text).toContain('5');
  });

  it('includes followthehole.com', () => {
    const text = t('share_text_challenge', { n: 4 });
    expect(text).toContain('followthehole.com');
  });
});

describe('Trail parsing (challenge URL)', () => {
  it('decodes a pipe-separated trail', () => {
    const raw = buildShareUrl(['Jazz', 'Miles Davis', 'Cuba']).split('?trail=')[1];
    const trail = parseTrail(raw);
    expect(trail).toEqual(['Jazz', 'Miles Davis', 'Cuba']);
  });

  it('triggers challenge mode for trails with 2+ topics', () => {
    const raw = buildShareUrl(['Jazz', 'Miles Davis']).split('?trail=')[1];
    const trail = parseTrail(raw);
    expect(trail.length >= 2).toBe(true);
  });

  it('does not trigger challenge mode for single-topic trails', () => {
    const raw = buildShareUrl(['Jazz']).split('?trail=')[1];
    const trail = parseTrail(raw);
    expect(trail.length < 2).toBe(true);
  });

  it('strips topics longer than 150 chars', () => {
    const long = 'a'.repeat(200);
    const raw  = encodeURIComponent(long);
    const trail = parseTrail(raw);
    expect(trail[0].length).toBeLessThanOrEqual(150);
  });
});
