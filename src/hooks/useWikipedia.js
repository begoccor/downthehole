const REST = (lang) => `https://${lang}.wikipedia.org/api/rest_v1`;
const MW   = (lang) => `https://${lang}.wikipedia.org/w/api.php`;

function isDisambig(data) {
  return (
    data.type === 'disambiguation' ||
    (data.description || '').toLowerCase().includes('disambiguation')
  );
}

async function safeFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function searchSuggestions(query, lang = 'en') {
  const slug = encodeURIComponent(query.trim());
  const url = `${MW(lang)}?action=query&list=search&srsearch=${slug}&srlimit=3&format=json&origin=*`;
  try {
    const data = await safeFetch(url);
    return (data.query?.search ?? [])
      .map(h => h.title)
      .filter(t => t.toLowerCase() !== query.trim().toLowerCase())
      .slice(0, 2);
  } catch {
    return [];
  }
}

export async function searchTopic(query, lang = 'en') {
  const slug = encodeURIComponent(query.trim());

  // 1. Try REST summary by title directly
  try {
    const data = await safeFetch(`${REST(lang)}/page/summary/${slug}`);
    if (!isDisambig(data)) return data;
  } catch (_) {
    // 404 or rate-limit — fall through to search
  }

  // 2. Use MW search API to find the canonical title
  const searchUrl =
    `${MW(lang)}?action=query&list=search&srsearch=${slug}&srlimit=1&format=json&origin=*`;
  const searchData = await safeFetch(searchUrl);
  const hit = searchData.query?.search?.[0]?.title;
  if (!hit) throw new Error('No results found');

  const data = await safeFetch(`${REST(lang)}/page/summary/${encodeURIComponent(hit)}`);
  if (isDisambig(data)) throw new Error('Topic is ambiguous — try being more specific');
  return data;
}

export async function fetchRelated(title, lang = 'en') {
  // Fast path: REST related endpoint (1 request)
  try {
    const data = await safeFetch(`${REST(lang)}/page/related/${encodeURIComponent(title)}`);
    const pages = (data.pages ?? [])
      .filter(p => !isDisambig(p) && p.extract && p.extract.length > 40);
    if (pages.length >= 4) return pages;
  } catch {
    // fall through to links-based fallback
  }

  // Fallback: article links + summaries (6 candidates instead of the old 12)
  try {
    const linksData = await safeFetch(
      `${MW(lang)}?action=query&prop=links&titles=${encodeURIComponent(title)}&pllimit=100&plnamespace=0&format=json&origin=*`
    );
    const page = Object.values(linksData.query?.pages ?? {})[0];
    const links = (page?.links ?? [])
      .map(l => l.title)
      .filter(t => {
        const lower = t.toLowerCase();
        return t !== title &&
          !lower.startsWith('list of') && !lower.startsWith('lists of') &&
          !lower.startsWith('liste') && !lower.startsWith('anexo:');
      });
    const candidates = links.sort(() => Math.random() - 0.5).slice(0, 6);
    const summaries = await Promise.all(
      candidates.map(t =>
        safeFetch(`${REST(lang)}/page/summary/${encodeURIComponent(t)}`).catch(() => null)
      )
    );
    return summaries.filter(Boolean).filter(s => !isDisambig(s) && s.extract && s.extract.length > 40);
  } catch {
    return [];
  }
}

async function fetchWikiquote(name, lang) {
  const qlang = ['en', 'fr', 'es'].includes(lang) ? lang : 'en';
  try {
    const url = `https://${qlang}.wikiquote.org/w/api.php?action=parse&page=${encodeURIComponent(name)}&prop=wikitext&section=1&format=json&origin=*`;
    const data = await safeFetch(url);
    const wikitext = data.parse?.wikitext?.['*'] ?? '';
    for (const line of wikitext.split('\n')) {
      // Match *"Quote" or *«Quote»
      const m = line.match(/^\*+\s*(?:"([^"]{40,280})"|«([^»]{40,280})»)/);
      if (m) return (m[1] || m[2]).trim();
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchCameo(summary, lang = 'en') {
  if (summary.coordinates?.lat != null) {
    const { lat, lon } = summary.coordinates;
    return {
      type: 'map',
      mapUrl: `https://maps.wikimedia.org/img/osm-intl,8,${lat},${lon},400x200@2x.png`,
      osmUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=10/${lat}/${lon}`,
    };
  }

  const desc = (summary.description || '').toLowerCase();
  const PERSON_SIGNALS = ['born', 'actor', 'actress', 'politician', 'author', 'writer',
    'scientist', 'musician', 'singer', 'artist', 'philosopher', 'director', 'poet',
    'painter', 'composer', 'architect', 'mathematician', 'physicist', 'chemist',
    'historian', 'journalist', 'filmmaker', 'athlete', 'footballer', 'player'];
  if (PERSON_SIGNALS.some(w => desc.includes(w))) {
    const quote = await fetchWikiquote(summary.title, lang);
    if (quote) return { type: 'quote', text: quote, source: summary.title };
  }

  return null;
}

export async function fetchFullIntro(title, lang = 'en') {
  const url = `${MW(lang)}?action=query&prop=extracts&exintro=true&explaintext=true&format=json&origin=*&titles=${encodeURIComponent(title)}`;
  const data = await safeFetch(url);
  const pages = data.query?.pages;
  if (!pages) return '';
  const page = Object.values(pages)[0];
  return page?.extract ?? '';
}

export async function fetchArticleImages(title, lang = 'en') {
  const url = `${MW(lang)}?action=query&generator=images&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime&gimlimit=20&format=json&origin=*`;
  try {
    const data = await safeFetch(url);
    const pages = data.query?.pages;
    if (!pages) return [];

    const SKIP = ['logo', 'flag', 'icon', 'coat', 'blank', 'seal', 'symbol', 'badge', 'emblem', 'ambox', 'commons', 'magnify', 'question', 'wikimedia', 'edit'];

    const seen = new Set();
    return Object.values(pages)
      .filter(p => {
        const info = p.imageinfo?.[0];
        if (!info?.url) return false;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)) return false;
        if ((info.width || 0) < 200 || (info.height || 0) < 150) return false;
        const name = (p.title || '').toLowerCase();
        if (SKIP.some(w => name.includes(w))) return false;
        if (seen.has(info.url)) return false;
        seen.add(info.url);
        return true;
      })
      .map(p => ({
        url: p.imageinfo[0].url,
        title: p.title.replace(/^File:/, '').replace(/_/g, ' ').replace(/\.\w+$/, ''),
        width: p.imageinfo[0].width,
        height: p.imageinfo[0].height,
      }))
      .slice(0, 6);
  } catch {
    return [];
  }
}

export function extractFacts(text) {
  if (!text) return [];
  return text
    .replace(/\([^)]{0,200}\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .split(/[.!]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 35 && s.length < 300)
    .map(s => s.endsWith('.') ? s : s + '.')
    .slice(0, 5);
}
