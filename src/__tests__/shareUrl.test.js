import { describe, it, expect } from 'vitest';

const SITE = 'https://www.followthehole.com';

function buildShareUrl(chain) {
  const encoded = chain.map(encodeURIComponent).join('|');
  return `${SITE}/?trail=${encoded}`;
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
  it('includes quote parameter with share text', () => {
    const shareUrl = buildShareUrl(['Octopus', 'Cephalopod']);
    const shareText = 'I went 2 hops deep: Octopus → Cephalopod 🕳️ Follow The Hole';
    const fbQuote = `${shareText}\n\n🌍 ${SITE}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fbQuote)}`;

    expect(fbUrl).toContain('sharer.php');
    expect(fbUrl).toContain(encodeURIComponent(SITE));
    expect(fbUrl).toContain('quote=');
    expect(fbUrl).toContain(encodeURIComponent(SITE)); // site link in quote
  });
});
