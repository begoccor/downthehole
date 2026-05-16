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
  const url =
    `${MW(lang)}?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=16&format=json&origin=*`;
  try {
    const data = await safeFetch(url);
    const hits = (data.query?.search ?? [])
      .filter(h => {
        if (h.title === title) return false;
        const lower = h.title.toLowerCase();
        return !lower.startsWith('list of') && !lower.startsWith('lists of') &&
               !lower.startsWith('liste de') && !lower.startsWith('liste des');
      })
      .slice(0, 10);

    const summaries = await Promise.all(
      hits.map(h =>
        safeFetch(`${REST(lang)}/page/summary/${encodeURIComponent(h.title)}`)
          .catch(() => null)
      )
    );
    return summaries.filter(Boolean).filter(p => !isDisambig(p) && p.extract && p.extract.length > 40);
  } catch {
    return [];
  }
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
    .replace(/\([^)]{0,80}\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .split(/[.!]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 35 && s.length < 300)
    .map(s => s.endsWith('.') ? s : s + '.')
    .slice(0, 5);
}
