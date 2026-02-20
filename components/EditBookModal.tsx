'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema, type BookInput } from '@/lib/validations';
import { Modal } from './Modal';
import { BookCoverUpload } from './BookCoverUpload';

interface Book extends BookInput {
  id: number;
}

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onSave: (id: number, data: BookInput) => Promise<void>;
}

export function EditBookModal({ isOpen, onClose, book, onSave }: EditBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    values: book
      ? {
          title: book.title,
          author: book.author,
          genre: book.genre || '',
          pages: book.pages || undefined,
          currentPage: (book as any).currentPage || undefined,
          status: book.status as 'a-ler' | 'lendo' | 'lido',
          summary: book.summary || '',
          coverUrl: (book as any).coverUrl || undefined,
          coverSource: (book as any).coverSource || undefined,
        }
      : {
          title: '',
          author: '',
          genre: '',
          pages: undefined,
          currentPage: undefined,
          status: 'a-ler',
          summary: '',
          coverUrl: undefined,
          coverSource: undefined,
        },
  });

  const statusValue = form.watch('status');
  const titleValue = form.watch('title');
  const coverUrl = form.watch('coverUrl');

  const onSubmit = async (data: BookInput) => {
    if (!book) return;

    setIsLoading(true);
    setError('');

    try {
      await onSave(book.id, data);
      onClose();
    } catch (err) {
      setError('Erro ao salvar livro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Livro">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
            Título
          </label>
          <input
            type="text"
            {...form.register('title')}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
            Autor
          </label>
          <input
            type="text"
            {...form.register('author')}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          />
          {form.formState.errors.author && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.author.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
              Gênero
            </label>
            <input
              type="text"
              {...form.register('genre')}
              className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
              Páginas
            </label>
            <input
              type="number"
              {...form.register('pages', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
            Status
          </label>
          <select
            {...form.register('status')}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          >
            <option value="a-ler">A ler</option>
            <option value="lendo">Lendo</option>
            <option value="lido">Lido</option>
          </select>
        </div>

        {statusValue === 'lendo' && (
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
              Página Atual
            </label>
            <input
              type="number"
              placeholder="Em qual página você está?"
              {...form.register('currentPage', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
            Resumo
          </label>
          <textarea
            {...form.register('summary')}
            rows={3}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary resize-none"
          />
        </div>

        {/* Gerenciador de Capas */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-3">
            Capa do Livro
          </label>
          <BookCoverUpload
            title={titleValue || 'Sem título'}
            currentCoverUrl={coverUrl}
            onCoverChange={(url, source) => {
              form.setValue('coverUrl', url);
              form.setValue('coverSource', source);
            }}
            onRemoveCover={() => {
              form.setValue('coverUrl', undefined);
              form.setValue('coverSource', undefined);
            }}
          />
        </div>

        {/* Hidden field para coverSource */}
        <input type="hidden" {...form.register('coverSource')} />

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-2 px-3 rounded border border-border-color text-text-muted hover:text-white transition text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:flex-1 py-2 px-3 rounded bg-gradient-to-r from-cyan-400 to-green-400 text-white font-medium text-sm hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
