'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookCover } from './BookCover';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  pages?: number | null;
  currentPage?: number | null;
  status: string;
  coverUrl?: string | null;
  onExpand: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  'a-ler': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'A ler' },
  lendo: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Lendo' },
  lido: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Lido' },
};

export function BookCard({
  id,
  title,
  author,
  genre,
  pages,
  currentPage,
  status,
  coverUrl,
  onExpand,
  onEdit,
  onDelete,
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusInfo = statusColors[status] || statusColors['a-ler'];

  // Calcular progresso de leitura
  const progressPercent =
    status === 'lendo' && pages && pages > 0 && currentPage
      ? Math.min(Math.max((currentPage / pages) * 100, 0), 100)
      : 0;

  return (
    <div
      className="bg-card border border-border-color rounded-lg overflow-hidden transition duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Cover with Status Badge */}
      <div className="relative h-64 flex-shrink-0">
        <BookCover title={title} coverUrl={coverUrl} className="h-full" />

        {/* Status Badge - Always Visible */}
        <div className="absolute top-2 right-2 backdrop-blur-sm bg-black/60 px-3 py-1.5 rounded border border-white/20 shadow-lg">
          <span className={`text-xs font-bold tracking-wide ${statusInfo.text}`}>
            {statusInfo.label.toUpperCase()}
          </span>
        </div>

        {/* Progress Bar for "Lendo" status */}
        {status === 'lendo' && pages && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 border-t border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content - Grows to fill space */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="font-semibold text-white truncate" title={title}>
          {title}
        </h3>
        <Link
          href={`/autor/${encodeURIComponent(author)}`}
          className="text-sm text-text-muted hover:text-secondary transition truncate"
          title={author}
        >
          {author}
        </Link>

        {/* Gênero e Páginas - Flex justify-between quando ambos existirem */}
        {(genre || pages) && (
          <div className="space-y-2">
            {genre && pages ? (
              <div className="flex justify-between text-xs text-text-muted">
                <span>{genre}</span>
                <span>{pages} Páginas</span>
              </div>
            ) : (
              <div className="flex gap-4 text-xs text-text-muted">
                {genre && <span>{genre}</span>}
                {pages && <span>{pages} Páginas</span>}
              </div>
            )}

            {/* Progresso de leitura */}
            {status === 'lendo' && pages && currentPage !== undefined && (
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
                  {currentPage} de {pages} páginas
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions - Rodapé fixo na parte inferior */}
      <div className="flex gap-2 p-4 border-t border-border-color mt-auto">
        <button
          onClick={() => onExpand(id)}
          className="flex-1 py-1 px-2 text-xs rounded bg-secondary/10 text-secondary hover:bg-secondary/20 transition font-medium"
        >
          Expandir
        </button>
        <button
          onClick={() => onEdit(id)}
          className="flex-1 py-1 px-2 text-xs rounded bg-accent/10 text-accent hover:bg-accent/20 transition font-medium"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(id)}
          className="py-1 px-2 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition font-medium"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
