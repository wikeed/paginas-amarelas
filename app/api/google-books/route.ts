import { NextResponse } from 'next/server';

// Simple in-memory cache with TTL to reduce requests to external API
type CacheEntry = { ts: number; data: any };
const CACHE_TTL = 3600 * 1000; // 3600s (1 hour)

if (!(global as any)._gb_cache) {
  (global as any)._gb_cache = new Map<string, CacheEntry>();
}
const cache: Map<string, CacheEntry> = (global as any)._gb_cache;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const maxResults = url.searchParams.get('maxResults') || '5';

    const key = `gb:${q}:m${maxResults}`;
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Use Open Library Search to avoid Google Books quota issues
    // decode q (client may send an encoded value) and encode it once for the external request
    const decodedQ = decodeURIComponent(q);
    const encodedQ = encodeURIComponent(decodedQ);
    const endpoint = `https://openlibrary.org/search.json?q=${encodedQ}&limit=${encodeURIComponent(
      maxResults
    )}`;

    const res = await fetch(endpoint);
    const data = await res.json();

    // Normalize Open Library response to a Google-Books-like shape for the client
    // so client mapping remains straightforward
    const normalized = {
      docs: data.docs || [],
      numFound: data.numFound || 0,
      raw: data,
    };

    // cache and return
    cache.set(key, { ts: now, data: normalized });
    return NextResponse.json(normalized);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar Google Books' }, { status: 500 });
  }
}
