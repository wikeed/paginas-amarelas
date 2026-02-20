'use client';

import { useState } from 'react';
import { FeedItem } from './FeedItem';
import { BookDetailsModal } from '../BookDetailsModal';

interface FeedListProps {
  items: Array<{
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
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function FeedList({ items, hasMore, isLoading, onLoadMore }: FeedListProps) {
  const [selectedBook, setSelectedBook] = useState<FeedListProps['items'][number] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleExpand = (bookId: number) => {
    const book = items.find((item) => item.id === bookId) || null;
    setSelectedBook(book);
    setIsDetailsOpen(!!book);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted mb-4">Nenhuma atividade recente ainda.</p>
        <p className="text-sm text-text-muted">
          Volte mais tarde para ver livros de outros usuários!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedItem key={item.id} book={item} onExpand={handleExpand} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
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
