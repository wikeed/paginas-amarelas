'use client';

import { useMemo, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { FeedList } from './FeedList';
import { searchBooks } from '@/lib/text';

interface FeedItem {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  pages?: number | null;
  currentPage?: number | null;
  summary?: string | null;
  coverUrl?: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    username: string;
    name?: string | null;
    image?: string | null;
  };
}

interface FeedPageClientProps {
  initialItems: FeedItem[];
  initialHasMore: boolean;
  initialNextCursor?: number;
}

export function FeedPageClient({
  initialItems,
  initialHasMore,
  initialNextCursor,
}: FeedPageClientProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<number | undefined>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const bookCounts = useMemo(
    () => ({
      total: feedItems.length,
      aLer: feedItems.filter((book) => book.status === 'a-ler').length,
      lendo: feedItems.filter((book) => book.status === 'lendo').length,
      lido: feedItems.filter((book) => book.status === 'lido').length,
    }),
    [feedItems]
  );

  const filteredByStatus = useMemo(() => {
    if (!activeFilter) return feedItems;
    return feedItems.filter((book) => book.status === activeFilter);
  }, [activeFilter, feedItems]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return filteredByStatus;
    return searchBooks(filteredByStatus, searchQuery);
  }, [filteredByStatus, searchQuery]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/feed?cursor=${nextCursor}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar feed');
      }

      const data = (await response.json()) as {
        items?: FeedItem[];
        hasMore?: boolean;
        nextCursor?: number;
      };

      const newItems = data.items ?? [];
      setFeedItems((prev) => [...prev, ...newItems]);
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Erro ao carregar mais itens do feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary/10">
      <AppHeader
        activeSection="feed"
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bookCounts={bookCounts}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-2">Nenhum livro encontrado nesse filtro.</p>
            <p className="text-sm text-text-muted">Tente outro status ou busca.</p>
          </div>
        ) : (
          <FeedList
            items={filteredItems}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
          />
        )}
      </main>
    </div>
  );
}
