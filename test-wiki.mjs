// node test-wiki.mjs
// Node has no default User-Agent, so we patch globalThis.fetch to add one.
// Browsers send their own User-Agent automatically — no patch needed there.
const _fetch = globalThis.fetch;
globalThis.fetch = (url, opts = {}) =>
  _fetch(url, { ...opts, headers: { 'User-Agent': 'DownTheHole-test/1.0', ...(opts.headers ?? {}) } });

import { searchTopic, fetchRelated, extractFacts } from './src/hooks/useWikipedia.js';

let passed = 0, failed = 0;

async function test(label, fn) {
  process.stdout.write(`  ${label}... `);
  try {
    const result = await fn();
    console.log('✓', typeof result === 'string' ? result : JSON.stringify(result));
    passed++;
  } catch (e) {
    console.log('✗', e.message);
    failed++;
  }
}

console.log('\n── searchTopic ──');
await test('well-known topic', async () => {
  const d = await searchTopic('jazz');
  if (!d.title) throw new Error('No title returned');
  return `"${d.title}" (${d.extract?.length ?? 0} chars extract)`;
});

await test('multi-word query', async () => {
  const d = await searchTopic('black holes');
  if (!d.title) throw new Error('No title returned');
  return `"${d.title}"`;
});

await test('person query', async () => {
  const d = await searchTopic('marie curie');
  if (!d.title) throw new Error('No title returned');
  return `"${d.title}"`;
});

await test('completely unknown term throws', async () => {
  try {
    await searchTopic('xyzzy_nonexistent_topic_12345');
    throw new Error('Should have thrown');
  } catch (e) {
    if (e.message === 'Should have thrown') throw e;
    return `threw as expected: "${e.message}"`;
  }
});

console.log('\n── fetchRelated ──');
await test('returns array for known topic', async () => {
  const rel = await fetchRelated('Jazz');
  if (!Array.isArray(rel)) throw new Error('Not an array');
  return `${rel.length} related topics: ${rel.slice(0, 3).map(p => p.title).join(', ')}`;
});

await test('returns [] for unknown topic (no crash)', async () => {
  const rel = await fetchRelated('xyzzy_nonexistent_12345');
  if (!Array.isArray(rel)) throw new Error('Not an array');
  return `${rel.length} results (expected 0 or few)`;
});

console.log('\n── extractFacts ──');
await test('splits sentences correctly', () => {
  const text =
    'Jazz is a music genre that originated in the African-American communities of New Orleans. ' +
    'It developed in the late nineteenth and early twentieth centuries. ' +
    'The style was characterized by improvisation, syncopation, and a swinging feel.';
  const facts = extractFacts(text);
  if (facts.length === 0) throw new Error('No facts extracted');
  return facts;
});

await test('handles empty string', () => {
  const facts = extractFacts('');
  if (!Array.isArray(facts) || facts.length !== 0) throw new Error('Should return []');
  return '[] as expected';
});

await test('filters short sentences', () => {
  const facts = extractFacts('Short. This is a much longer sentence that should be included in the facts.');
  const hasShort = facts.some(f => f.length < 35);
  if (hasShort) throw new Error('Short sentence slipped through');
  return facts;
});

console.log(`\n── Result: ${passed} passed, ${failed} failed ──\n`);
if (failed > 0) process.exit(1);
