import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch before importing the module
const mockFetch = vi.fn();
global.fetch = mockFetch;

const { fetchArticleImages } = await import('../hooks/useWikipedia.js');

function makePage(id, url, mime = 'image/jpeg', width = 800, height = 600) {
  return {
    title: `File:Image_${id}.jpg`,
    imageinfo: [{ url, mime, width, height }],
  };
}

function mockApiResponse(pages) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ query: { pages } }),
  });
}

describe('fetchArticleImages deduplication', () => {
  beforeEach(() => mockFetch.mockReset());

  it('removes duplicate URLs', async () => {
    const pages = {
      1: makePage(1, 'https://example.com/img1.jpg'),
      2: makePage(2, 'https://example.com/img1.jpg'), // duplicate
      3: makePage(3, 'https://example.com/img2.jpg'),
    };
    mockApiResponse(pages);
    const result = await fetchArticleImages('Test');
    const urls = result.map(r => r.url);
    expect(urls).toHaveLength(2);
    expect(new Set(urls).size).toBe(2);
  });

  it('filters images below minimum dimensions', async () => {
    const pages = {
      1: makePage(1, 'https://example.com/small.jpg', 'image/jpeg', 100, 80),
      2: makePage(2, 'https://example.com/big.jpg',   'image/jpeg', 800, 600),
    };
    mockApiResponse(pages);
    const result = await fetchArticleImages('Test');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com/big.jpg');
  });

  it('filters non-image mime types', async () => {
    const pages = {
      1: makePage(1, 'https://example.com/file.svg', 'image/svg+xml'),
      2: makePage(2, 'https://example.com/photo.jpg', 'image/jpeg'),
    };
    mockApiResponse(pages);
    const result = await fetchArticleImages('Test');
    expect(result).toHaveLength(1);
    expect(result[0].url).toContain('photo.jpg');
  });

  it('filters images with skip keywords in title', async () => {
    const pages = {
      1: { title: 'File:Logo_example.png', imageinfo: [{ url: 'https://example.com/logo.png', mime: 'image/png', width: 800, height: 600 }] },
      2: makePage(2, 'https://example.com/photo.jpg'),
    };
    mockApiResponse(pages);
    const result = await fetchArticleImages('Test');
    expect(result).toHaveLength(1);
  });

  it('returns at most 6 images', async () => {
    const pages = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        i, makePage(i, `https://example.com/img${i}.jpg`),
      ])
    );
    mockApiResponse(pages);
    const result = await fetchArticleImages('Test');
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('returns empty array on fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchArticleImages('Test');
    expect(result).toEqual([]);
  });
});
