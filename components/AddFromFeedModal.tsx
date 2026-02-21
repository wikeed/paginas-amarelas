'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema, type BookInput } from '@/lib/validations';
import { Modal } from './Modal';

interface AddFromFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookInput) => Promise<void>;
  initialData?: {
    title: string;
    author: string;
    coverUrl?: string | null;
    summary?: string | null;
    pages?: number | null;
  };
}

export function AddFromFeedModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddFromFeedModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      genre: '',
      pages: initialData?.pages || undefined,
      currentPage: undefined,
      status: 'a-ler',
      summary: initialData?.summary || '',
      coverUrl: initialData?.coverUrl || undefined,
      coverSource: 'api',
    },
  });

  const statusValue = form.watch('status');

  const handleClose = () => {
    setError('');
    form.reset({
      title: initialData?.title || '',
      author: initialData?.author || '',
      genre: '',
      pages: initialData?.pages || undefined,
      currentPage: undefined,
      status: 'a-ler',
      summary: initialData?.summary || '',
      coverUrl: initialData?.coverUrl || undefined,
      coverSource: 'api',
    });
    onClose();
  };

  const onSubmit = async (data: BookInput) => {
    setIsLoading(true);
    setError('');

    try {
      await onSave(data);
      handleClose();
    } catch (err) {
      setError('Erro ao adicionar livro');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Livro à Sua Biblioteca">
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
            placeholder="Digite o título"
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
            placeholder="Digite o autor"
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
              placeholder="Ex: Ficção (opcional)"
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
              placeholder="Ex: 300 (opcional)"
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
            placeholder="Digite um resumo (opcional)"
            {...form.register('summary')}
            rows={3}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary resize-none"
          />
        </div>

        <input type="hidden" {...form.register('coverUrl')} />
        <input type="hidden" {...form.register('coverSource')} />

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:flex-1 py-2 px-3 rounded border border-border-color text-text-muted hover:text-white transition text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:flex-1 py-2 px-3 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium text-sm hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Livro'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
