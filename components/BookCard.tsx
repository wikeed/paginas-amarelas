'use client';

import { useState } from 'react';
import { BookCover } from './BookCover';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  pages?: number | null;
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
  status,
  coverUrl,
  onExpand,
  onEdit,
  onDelete,
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const statusInfo = statusColors[status] || statusColors['a-ler'];

  return (
    <div
      className="bg-card border border-border-color rounded-lg overflow-hidden transition duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Cover with Status Badge */}
      <div className="relative h-64">
        <BookCover title={title} coverUrl={coverUrl} className="h-full" />
        {/* Status Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
        >
          {statusInfo.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-white truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-text-muted truncate">{author}</p>

        {(genre || pages) && (
          <div className="flex gap-4 text-xs text-text-muted">
            {genre && <span>{genre}</span>}
            {pages && <span>{pages} pgs</span>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border-color">
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
    </div>
  );
}
