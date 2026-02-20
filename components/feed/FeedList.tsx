'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { FeedItem } from './FeedItem';

interface FeedListProps {
  items: Array<{
    id: number;
    title: string;
    author: string;
    coverUrl?: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      username: string;
      name?: string | null;
      image?: string | null;
    };
  }>;
  hasMore: boolean;
  nextCursor?: number;
  currentCursor?: number;
}

export function FeedList({ items, hasMore, nextCursor, currentCursor }: FeedListProps) {
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!nextCursor || isPending) return;

    // Simulado: scroll para próxima página
    const url = new URL(window.location.href);
    url.searchParams.set('cursor', nextCursor.toString());
    window.location.href = url.toString();
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
        <FeedItem key={item.id} book={item} />
      ))}

      {/* Paginação */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="px-6 py-3 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
