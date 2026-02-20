'use client';

import { useState } from 'react';
import { FeedItem } from './FeedItem';
import { BookDetailsModal } from '../BookDetailsModal';

interface FeedListProps {
  initialItems: Array<{
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
  }>;
  initialHasMore: boolean;
  initialNextCursor?: number;
}

export function FeedList({ initialItems, initialHasMore, initialNextCursor }: FeedListProps) {
  const [feedItems, setFeedItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<number | undefined>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<FeedListProps['initialItems'][number] | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleExpand = (bookId: number) => {
    const book = feedItems.find((item) => item.id === bookId) || null;
    setSelectedBook(book);
    setIsDetailsOpen(!!book);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/feed?cursor=${nextCursor}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar feed');
      }

      const data = (await response.json()) as {
        items?: FeedListProps['initialItems'];
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

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted mb-4">Nenhuma atividade recente ainda.</p>
        <p className="text-sm text-text-muted">
          Volte mais tarde para ver livros de outros usuários!
        </p>
      </div>
    );
  }

  const filteredItems = activeFilter
    ? feedItems.filter((item) => item.status === activeFilter)
    : feedItems;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            activeFilter === null
              ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
              : 'border border-border-color text-text-muted hover:text-white'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveFilter('a-ler')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            activeFilter === 'a-ler'
              ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
              : 'border border-border-color text-text-muted hover:text-white'
          }`}
        >
          A ler
        </button>
        <button
          onClick={() => setActiveFilter('lendo')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            activeFilter === 'lendo'
              ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
              : 'border border-border-color text-text-muted hover:text-white'
          }`}
        >
          Lendo
        </button>
        <button
          onClick={() => setActiveFilter('lido')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            activeFilter === 'lido'
              ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
              : 'border border-border-color text-text-muted hover:text-white'
          }`}
        >
          Lido
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted mb-2">Nenhum livro encontrado nesse filtro.</p>
          <p className="text-sm text-text-muted">Tente outro status.</p>
        </div>
      ) : (
        filteredItems.map((item) => <FeedItem key={item.id} book={item} onExpand={handleExpand} />)
      )}

      {/* Paginação */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}

      <BookDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        book={
          selectedBook
            ? {
                id: selectedBook.id,
                title: selectedBook.title,
                author: selectedBook.author,
                genre: selectedBook.genre ?? null,
                pages: selectedBook.pages ?? null,
                currentPage: selectedBook.currentPage ?? null,
                status: selectedBook.status,
                summary: selectedBook.summary ?? null,
                coverUrl: selectedBook.coverUrl ?? null,
              }
            : null
        }
      />
    </div>
  );
}
