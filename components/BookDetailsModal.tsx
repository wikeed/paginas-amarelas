'use client';

import { Modal } from './Modal';

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  pages?: number | null;
  currentPage?: number | null;
  status: string;
  summary?: string | null;
  coverUrl?: string | null;
}

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

const statusLabels: Record<string, string> = {
  'a-ler': 'A ler',
  lendo: 'Lendo',
  lido: 'Lido',
};

export function BookDetailsModal({ isOpen, onClose, book }: BookDetailsModalProps) {
  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Livro">
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Título</h3>
          <p className="text-white">{book.title}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Autor</h3>
          <p className="text-white">{book.author}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {book.genre && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Gênero</h3>
              <p className="text-white">{book.genre}</p>
            </div>
          )}
          {book.pages && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Páginas</h3>
              <p className="text-white">{book.pages}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Status</h3>
          <p className="text-white">{statusLabels[book.status] || book.status}</p>
        </div>

        {book.status === 'lendo' && book.currentPage !== undefined && (
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Página Atual</h3>
            <p className="text-white">
              {book.currentPage} {book.pages ? `de ${book.pages}` : ''}
            </p>
          </div>
        )}

        {book.summary && (
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase mb-1">Resumo</h3>
            <p className="text-white text-sm leading-relaxed">{book.summary}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
