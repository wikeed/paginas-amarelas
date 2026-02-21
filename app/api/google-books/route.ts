import { NextResponse } from 'next/server';

// Simple in-memory cache with TTL to reduce requests to external API
type CacheEntry = { ts: number; data: any };
const CACHE_TTL = 3600 * 1000; // 3600s (1 hour)

if (!(global as any)._gb_cache) {
  (global as any)._gb_cache = new Map<string, CacheEntry>();
}
const cache: Map<string, CacheEntry> = (global as any)._gb_cache;

function ensureHttps(url?: string | null) {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
}

function boostThumbnailQuality(url: string) {
  const safeUrl = ensureHttps(url);

  try {
    const parsed = new URL(safeUrl);
    const zoom = parsed.searchParams.get('zoom');
    if (zoom === '1') {
      parsed.searchParams.set('zoom', '2');
    }
    return parsed.toString();
  } catch {
    return safeUrl.replace('zoom=1', 'zoom=2');
  }
}

function pickBestGoogleCover(imageLinks?: {
  large?: string;
  medium?: string;
  small?: string;
  thumbnail?: string;
  smallThumbnail?: string;
}) {
  if (!imageLinks) return '';

  if (imageLinks.large) return ensureHttps(imageLinks.large);
  if (imageLinks.medium) return ensureHttps(imageLinks.medium);
  if (imageLinks.small) return ensureHttps(imageLinks.small);
  if (imageLinks.thumbnail) return boostThumbnailQuality(imageLinks.thumbnail);
  if (imageLinks.smallThumbnail) return boostThumbnailQuality(imageLinks.smallThumbnail);

  return '';
}

function normalizeGoogleItems(items: any[] = []) {
  return items.map((item) => {
    const volumeInfo = item?.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};
    const bestCover = pickBestGoogleCover(imageLinks);

    return {
      id: item.id,
      volumeInfo: {
        ...volumeInfo,
        imageLinks: {
          ...imageLinks,
          large: bestCover || imageLinks.large,
          thumbnail: bestCover || imageLinks.thumbnail,
          smallThumbnail: bestCover || imageLinks.smallThumbnail,
        },
      },
      source: 'google',
    };
  });
}

function openLibraryCover(doc: any) {
  if (doc?.cover_edition_key) {
    return `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`;
  }

  if (doc?.cover_i) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  }

  return '';
}

function normalizeOpenLibraryDocs(docs: any[] = []) {
  return docs.map((doc) => {
    const cover = openLibraryCover(doc);
    const language = Array.isArray(doc?.language) ? doc.language[0] : undefined;

    return {
      id: doc.key || `${doc.title || 'book'}-${doc.cover_i || ''}`,
      volumeInfo: {
        title: doc.title || '',
        authors: doc.author_name || [],
        pageCount: doc.number_of_pages_median || undefined,
        description: doc.first_sentence
          ? Array.isArray(doc.first_sentence)
            ? doc.first_sentence[0]
            : doc.first_sentence
          : '',
        publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
        language,
        imageLinks: cover
          ? {
              large: cover,
              thumbnail: cover,
              smallThumbnail: cover,
            }
          : undefined,
      },
      source: 'openlibrary',
    };
  });
}

async function fetchGoogleBooks(q: string, maxResults: string, langRestrict?: string) {
  const endpoint = new URL('https://www.googleapis.com/books/v1/volumes');
  endpoint.searchParams.set('q', q);
  endpoint.searchParams.set('maxResults', maxResults);
  endpoint.searchParams.set('printType', 'books');

  if (langRestrict) {
    endpoint.searchParams.set('langRestrict', langRestrict);
  }

  const res = await fetch(endpoint.toString());
  if (!res.ok) {
    throw new Error(`Google Books error: ${res.status}`);
  }

  return res.json();
}

async function fetchOpenLibrary(q: string, maxResults: string) {
  const encodedQ = encodeURIComponent(q);
  const endpoint = `https://openlibrary.org/search.json?q=${encodedQ}&limit=${encodeURIComponent(
    maxResults
  )}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Open Library error: ${res.status}`);
  }

  return res.json();
}

// Build search query strings for different APIs
function buildGoogleBooksQuery(q: string, mode: 'title' | 'author' = 'title'): string {
  if (mode === 'author') {
    return `inauthor:"${q}"`;
  }
  return q;
}

function buildOpenLibraryQuery(q: string, mode: 'title' | 'author' = 'title'): string {
  if (mode === 'author') {
    return `author:"${q}"`;
  }
  return q;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const maxResults = url.searchParams.get('maxResults') || '5';
    const mode = (url.searchParams.get('mode') as 'title' | 'author') || 'title';

    const key = `gb:${q}:m${maxResults}:${mode}`;
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const decodedQ = decodeURIComponent(q);

    let googlePtData: any = null;
    let googleAnyData: any = null;
    let openLibraryData: any = null;

    try {
      const googleQuery = buildGoogleBooksQuery(decodedQ, mode);
      googlePtData = await fetchGoogleBooks(googleQuery, maxResults, 'pt');
    } catch {
      googlePtData = null;
    }

    let items = normalizeGoogleItems(googlePtData?.items || []);
    let strategy = 'google:pt';

    if (items.length === 0) {
      try {
        const googleQuery = buildGoogleBooksQuery(decodedQ, mode);
        googleAnyData = await fetchGoogleBooks(googleQuery, maxResults);
      } catch {
        googleAnyData = null;
      }

      items = normalizeGoogleItems(googleAnyData?.items || []);
      strategy = 'google:any';
    }

    if (items.length === 0) {
      try {
        const olQuery = buildOpenLibraryQuery(decodedQ, mode);
        openLibraryData = await fetchOpenLibrary(olQuery, maxResults);
      } catch {
        openLibraryData = null;
      }

      items = normalizeOpenLibraryDocs(openLibraryData?.docs || []);
      strategy = 'openlibrary';
    }

    const normalized = {
      items,
      totalItems:
        googlePtData?.totalItems || googleAnyData?.totalItems || openLibraryData?.numFound || 0,
      strategy,
    };

    // cache and return
    cache.set(key, { ts: now, data: normalized });
    return NextResponse.json(normalized);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar Google Books' }, { status: 500 });
  }
}
