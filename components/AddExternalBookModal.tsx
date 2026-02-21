'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { useSession } from 'next-auth/react';

interface ExternalBook {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  thumbnail?: string;
  pageCount?: number;
  publishedDate?: string;
  language?: string;
  source: 'google' | 'openlibrary';
}

interface AddExternalBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: ExternalBook | null;
  onSaved?: () => void;
}

const statusOptions = [
  { value: 'a-ler', label: 'Quero ler' },
  { value: 'lendo', label: 'Lendo' },
  { value: 'lido', label: 'Lido' },
];

const ratingOptions = [
  { value: 0, label: 'Sem nota' },
  { value: 1, label: '★ Péssimo' },
  { value: 2, label: '★★ Ruim' },
  { value: 3, label: '★★★ Bom' },
  { value: 4, label: '★★★★ Muito bom' },
  { value: 5, label: '★★★★★ Excelente' },
];

export function AddExternalBookModal({
  isOpen,
  onClose,
  book,
  onSaved,
}: AddExternalBookModalProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState('a-ler');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!book) return null;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Construir externalId baseado na fonte
      const externalId =
        book.source === 'google'
          ? `google:${book.id}`
          : `openlibrary:${book.id}`;

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Dados básicos
          title: book.title,
          author: book.authors.join(', '),
          pages: book.pageCount,
          summary: book.description,
          coverUrl: book.thumbnail,
          coverSource: 'api',
          externalId,
          // Dados de user input
          status,
          rating: rating > 0 ? rating : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar livro');
      }

      onSaved?.();
      handleClose();
    } catch (err) {
      console.error('Error saving book:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar livro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStatus('a-ler');
    setRating(0);
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Adicionar "${book.title}" à biblioteca`}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
            Avaliação
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          >
            {ratingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
            Anotações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione suas observações sobre o livro..."
            rows={3}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary resize-none placeholder-text-muted"
          />
        </div>

        {/* Book info preview */}
        <div className="p-3 rounded bg-primary/50 border border-border-color text-xs text-text-muted space-y-1">
          <div>
            <span className="font-semibold">Título:</span> {book.title}
          </div>
          <div>
            <span className="font-semibold">Autor(es):</span> {book.authors.join(', ')}
          </div>
          {book.pageCount && (
            <div>
              <span className="font-semibold">Páginas:</span> {book.pageCount}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:flex-1 py-2 px-3 rounded border border-border-color text-text-muted hover:text-white transition text-sm disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:flex-1 py-2 px-3 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium text-sm hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Adicionar à Biblioteca'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
