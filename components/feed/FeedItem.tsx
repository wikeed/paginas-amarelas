'use client';

import Link from 'next/link';
import { BookCover } from '../BookCover';
import { Avatar } from '../Avatar';
import { formatTimeAgo } from '@/lib/text';

interface FeedItemProps {
  book: {
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
  };
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  'a-ler': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'A ler' },
  lendo: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Lendo' },
  lido: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Lido' },
};

export function FeedItem({ book }: FeedItemProps) {
  const statusInfo = statusColors[book.status] || statusColors['a-ler'];
  const isNew = new Date().getTime() - new Date(book.createdAt).getTime() < 86400000; // 24h

  return (
    <div className="border border-border-color rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow duration-300">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Capa do livro */}
        <div className="w-full sm:w-32 flex-shrink-0">
          <div className="relative h-40 sm:h-32 rounded overflow-hidden bg-black/40 border border-border-color">
            <BookCover title={book.title} coverUrl={book.coverUrl} className="h-full" />
            {isNew && (
              <div className="absolute top-2 right-2 bg-accent text-black text-xs font-bold px-2 py-1 rounded">
                NOVO
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Cabeçalho com usuário */}
          <div>
            <Link href={`/u/${book.user.username}`} className="flex items-center gap-2 sm:gap-3 group mb-3">
              <Avatar name={book.user.username} image={book.user.image} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate group-hover:text-secondary transition-colors">
                  @{book.user.username}
                </p>
                <p className="text-text-muted text-xs">
                  {new Date(book.createdAt).getTime() === new Date(book.updatedAt).getTime()
                    ? 'Adicionou um livro'
                    : 'Atualizou um livro'}
                </p>
              </div>
            </Link>

            {/* Informações do livro */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg line-clamp-2" title={book.title}>
                {book.title}
              </h3>
              <p className="text-text-muted text-sm truncate" title={book.author}>
                por {book.author}
              </p>

              {/* Status Badge */}
              <div className="inline-block">
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-1 rounded ${statusInfo.bg} ${statusInfo.text}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Rodapé com timestamp */}
          <div className="text-xs text-text-muted mt-3">
            {formatTimeAgo(book.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
