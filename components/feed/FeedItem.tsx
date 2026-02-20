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
  };
  onExpand: (bookId: number) => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  'a-ler': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'A ler' },
  lendo: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Lendo' },
  lido: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Lido' },
};

export function FeedItem({ book, onExpand }: FeedItemProps) {
  const statusInfo = statusColors[book.status] || statusColors['a-ler'];
  const isNew = new Date().getTime() - new Date(book.createdAt).getTime() < 86400000; // 24h
  const progressPercent =
    book.status === 'lendo' && book.pages && book.pages > 0 && book.currentPage != null
      ? Math.min(Math.max((book.currentPage / book.pages) * 100, 0), 100)
      : 0;

  return (
    <div className="relative border border-border-color rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow duration-300">
      {isNew && (
        <div className="absolute top-3 right-3 bg-accent text-black text-xs font-bold px-2 py-1 rounded z-10">
          NOVO
        </div>
      )}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Capa do livro */}
        <div className="w-full sm:w-32 flex-shrink-0">
          <div className="relative h-40 sm:h-32 rounded overflow-hidden bg-black/40 border border-border-color">
            <BookCover title={book.title} coverUrl={book.coverUrl} className="h-full" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Cabeçalho com usuário */}
          <div>
            <Link
              href={`/u/${book.user.username}`}
              className="flex items-center gap-2 sm:gap-3 group mb-3"
            >
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

              {/* Progresso de leitura */}
              {book.status === 'lendo' && book.pages && book.currentPage != null && (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-400 font-semibold">Lendo</span>
                    <span className="text-text-muted">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-primary/50 rounded-full overflow-hidden border border-border-color">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-text-muted text-center">
                    {book.currentPage} de {book.pages} páginas
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé com timestamp */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-text-muted">{formatTimeAgo(book.updatedAt)}</span>
            <button
              onClick={() => onExpand(book.id)}
              className="px-3 py-1 text-xs rounded bg-secondary/10 text-secondary hover:bg-secondary/20 transition font-medium"
            >
              Expandir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
