'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema, type BookInput } from '@/lib/validations';
import { Modal } from './Modal';
import { BookCoverUpload } from './BookCoverUpload';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookInput) => Promise<void>;
}

export function CreateBookModal({ isOpen, onClose, onSave }: CreateBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  
  // Estados para busca por título
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const debounceRef = useRef<number | null>(null);
  const suggestionsAbortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [didSelectSuggestion, setDidSelectSuggestion] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // Estados para busca por autor
  const [authorSuggestions, setAuthorSuggestions] = useState<any[]>([]);
  const authorDebounceRef = useRef<number | null>(null);
  const authorAbortRef = useRef<AbortController | null>(null);
  const authorContainerRef = useRef<HTMLDivElement | null>(null);
  const [suppressAuthorSuggestions, setSuppressAuthorSuggestions] = useState(false);
  const [didSelectAuthorSuggestion, setDidSelectAuthorSuggestion] = useState(false);
  const [authorSuggestionsError, setAuthorSuggestionsError] = useState('');
  const [authorSuggestionsLoading, setAuthorSuggestionsLoading] = useState(false);

  const form = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
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

  const titleValue = form.watch('title');
  const authorValue = form.watch('author');
  const statusValue = form.watch('status');
  const coverUrl = form.watch('coverUrl');

  // shared fetch function to allow manual trigger (uses Open Library via proxy)
  const fetchSuggestionsNow = useCallback(
    async (query?: string) => {
      const t = (query ?? titleValue)?.trim();
      console.log('[CreateBookModal] fetchSuggestionsNow called, title=', titleValue);
      if (!t || t.length < 3) {
        console.log('[CreateBookModal] query too short, clearing suggestions');
        setSuggestions([]);
        return;
      }
      if (suppressSuggestions || didSelectSuggestion) return;

      try {
        console.log('[CreateBookModal] fetching suggestions (Open Library) for', t);
        setSuggestionsLoading(true);
        // abort any in-flight request
        if (suggestionsAbortRef.current) suggestionsAbortRef.current.abort();
        const controller = new AbortController();
        suggestionsAbortRef.current = controller;

        const res = await fetch(`/api/google-books?q=${encodeURIComponent(t)}&maxResults=5`, {
          signal: controller.signal,
        });

        if (res.status === 429) {
          setSuggestions([]);
          setSuggestionsError('Limite da API atingido. Tente novamente mais tarde.');
          setSuppressSuggestions(true);
          window.setTimeout(() => {
            setSuppressSuggestions(false);
            setSuggestionsError('');
          }, 10000);
          setSuggestionsLoading(false);
          return;
        }

        const data = await res.json();
        setSuggestionsError('');

        const items = (data.items || []).map((item: any) => {
          const volumeInfo = item.volumeInfo || {};
          const imageLinks = volumeInfo.imageLinks || {};
          const coverUrl =
            imageLinks.large ||
            imageLinks.medium ||
            imageLinks.small ||
            imageLinks.thumbnail ||
            imageLinks.smallThumbnail ||
            '';

          return {
            id: item.id || `${volumeInfo.title}-${coverUrl || ''}`,
            title: volumeInfo.title || '',
            authors: volumeInfo.authors || [],
            pageCount: volumeInfo.pageCount || 0,
            description:
              typeof volumeInfo.description === 'string'
                ? volumeInfo.description
                : volumeInfo.description?.text || '',
            thumbnail: coverUrl,
            publishedDate: volumeInfo.publishedDate || '',
            language: volumeInfo.language || '',
          } as any;
        });

        setSuggestions(items);
        setSuggestionsLoading(false);
        suggestionsAbortRef.current = null;
      } catch (err) {
        if ((err as any)?.name === 'AbortError') {
          console.log('[CreateBookModal] fetch aborted');
          setSuggestionsLoading(false);
          return;
        }
        console.error('[CreateBookModal] fetch error', err);
        setSuggestions([]);
        setSuggestionsLoading(false);
      }
    },
    [didSelectSuggestion, suppressSuggestions, titleValue]
  );

  // Função de busca por autor
  const fetchAuthorSuggestionsNow = useCallback(
    async (query?: string) => {
      const authorQuery = (query ?? authorValue)?.trim();
      console.log('[CreateBookModal] fetchAuthorSuggestionsNow called, author=', authorValue);
      if (!authorQuery || authorQuery.length < 3) {
        console.log('[CreateBookModal] author query too short, clearing suggestions');
        setAuthorSuggestions([]);
        return;
      }
      if (suppressAuthorSuggestions || didSelectAuthorSuggestion) return;

      try {
        console.log('[CreateBookModal] fetching author suggestions for', authorQuery);
        setAuthorSuggestionsLoading(true);
        // abort any in-flight request
        if (authorAbortRef.current) authorAbortRef.current.abort();
        const controller = new AbortController();
        authorAbortRef.current = controller;

        // Buscar por autor com mode=author
        const res = await fetch(`/api/google-books?q=${encodeURIComponent(authorQuery)}&mode=author&maxResults=10`, {
          signal: controller.signal,
        });

        if (res.status === 429) {
          setAuthorSuggestions([]);
          setAuthorSuggestionsError('Limite da API atingido. Tente novamente mais tarde.');
          setSuppressAuthorSuggestions(true);
          window.setTimeout(() => {
            setSuppressAuthorSuggestions(false);
            setAuthorSuggestionsError('');
          }, 10000);
          setAuthorSuggestionsLoading(false);
          return;
        }

        const data = await res.json();
        setAuthorSuggestionsError('');

        const items = (data.items || []).map((item: any) => {
          const volumeInfo = item.volumeInfo || {};
          const imageLinks = volumeInfo.imageLinks || {};
          const coverUrl =
            imageLinks.large ||
            imageLinks.medium ||
            imageLinks.small ||
            imageLinks.thumbnail ||
            imageLinks.smallThumbnail ||
            '';

          return {
            id: item.id || `${volumeInfo.title}-${coverUrl || ''}`,
            title: volumeInfo.title || '',
            authors: volumeInfo.authors || [],
            pageCount: volumeInfo.pageCount || 0,
            description:
              typeof volumeInfo.description === 'string'
                ? volumeInfo.description
                : volumeInfo.description?.text || '',
            thumbnail: coverUrl,
            publishedDate: volumeInfo.publishedDate || '',
            language: volumeInfo.language || '',
          } as any;
        });

        setAuthorSuggestions(items);
        setAuthorSuggestionsLoading(false);
        authorAbortRef.current = null;
      } catch (err) {
        if ((err as any)?.name === 'AbortError') {
          console.log('[CreateBookModal] author fetch aborted');
          setAuthorSuggestionsLoading(false);
          return;
        }
        console.error('[CreateBookModal] author fetch error', err);
        setAuthorSuggestions([]);
        setAuthorSuggestionsLoading(false);
      }
    },
    [didSelectAuthorSuggestion, suppressAuthorSuggestions, authorValue]
  );

  // Effect para busca por título (debounced)
  useEffect(() => {
    if (suppressSuggestions) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    // debounce 500ms
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestionsNow();
    }, 500);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [fetchSuggestionsNow, suppressSuggestions, titleValue]);

  // Effect para busca por autor (debounced)
  useEffect(() => {
    if (suppressAuthorSuggestions) return;
    if (authorDebounceRef.current) window.clearTimeout(authorDebounceRef.current);

    // debounce 500ms
    authorDebounceRef.current = window.setTimeout(() => {
      fetchAuthorSuggestionsNow();
    }, 500);

    return () => {
      if (authorDebounceRef.current) window.clearTimeout(authorDebounceRef.current);
    };
  }, [fetchAuthorSuggestionsNow, suppressAuthorSuggestions, authorValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!containerRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close author suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!authorContainerRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!authorContainerRef.current.contains(e.target)) {
        setAuthorSuggestions([]);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const onSubmit = async (data: BookInput) => {
    setIsLoading(true);
    setError('');

    try {
      await onSave(data);
      form.reset();
      onClose();
    } catch (err) {
      setError('Erro ao criar livro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Livro">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="relative" ref={containerRef}>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
            Título
          </label>
          <input
            type="text"
            placeholder="Digite o título"
            {...form.register('title', {
              onChange: () => {
                setDidSelectSuggestion(false);
              },
            })}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.title.message}</p>
          )}

          {suggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 bg-primary border border-border-color mt-1 rounded max-h-60 overflow-auto">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 cursor-pointer"
                  onClick={() => {
                    // prevent the title watch effect from immediately re-fetching
                    setSuppressSuggestions(true);
                    setDidSelectSuggestion(true);
                    if (debounceRef.current) {
                      window.clearTimeout(debounceRef.current);
                    }
                    if (suggestionsAbortRef.current) {
                      suggestionsAbortRef.current.abort();
                      suggestionsAbortRef.current = null;
                    }
                    setSuggestionsLoading(false);
                    form.setValue('title', s.title);
                    form.setValue('author', s.authors.join(', '));
                    form.setValue(
                      'pages',
                      s.pageCount && s.pageCount > 0 ? s.pageCount : undefined
                    );
                    form.setValue('summary', s.description || '');
                    if (s.thumbnail) {
                      form.setValue('coverUrl', s.thumbnail);
                      form.setValue('coverSource', 'api');
                    }
                    setSuggestions([]);
                    // re-enable after a short delay
                    window.setTimeout(() => setSuppressSuggestions(false), 350);
                  }}
                >
                  {s.thumbnail ? (
                    <div className="w-10 h-14 relative rounded overflow-hidden">
                      <Image
                        src={s.thumbnail}
                        alt={s.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                        quality={85}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-14 bg-border-color rounded" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">{s.title}</div>
                    <div className="text-xs text-text-muted">
                      {s.authors.join(', ')}
                      {s.language ? ` • ${String(s.language).toUpperCase()}` : ''}
                    </div>
                  </div>
                </li>
              ))}
              {suggestionsLoading && (
                <li className="px-2 py-2 text-xs text-text-muted">Buscando...</li>
              )}
              {suggestionsError && (
                <li className="px-2 py-2 text-xs text-red-400">{suggestionsError}</li>
              )}
            </ul>
          )}
          {/* inline status when list is empty */}
          {titleValue && titleValue.trim().length >= 3 && (
            <div className="mt-1 text-xs text-text-muted">
              {suggestionsLoading && <span>Buscando sugestões...</span>}
              {!suggestionsLoading && suggestionsError && (
                <span className="text-red-400">{suggestionsError}</span>
              )}
              {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && (
                <span>Nenhuma sugestão encontrada</span>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={authorContainerRef}>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
            Autor
          </label>
          <input
            type="text"
            placeholder="Digite o nome do autor"
            {...form.register('author', {
              onChange: () => {
                setDidSelectAuthorSuggestion(false);
              },
            })}
            className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
          />
          {form.formState.errors.author && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.author.message}</p>
          )}

          {authorSuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 bg-primary border border-border-color mt-1 rounded max-h-60 overflow-auto">
              {authorSuggestions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 cursor-pointer"
                  onClick={() => {
                    // prevent the author watch effect from immediately re-fetching
                    setSuppressAuthorSuggestions(true);
                    setDidSelectAuthorSuggestion(true);
                    if (authorDebounceRef.current) {
                      window.clearTimeout(authorDebounceRef.current);
                    }
                    if (authorAbortRef.current) {
                      authorAbortRef.current.abort();
                      authorAbortRef.current = null;
                    }
                    setAuthorSuggestionsLoading(false);
                    form.setValue('title', s.title);
                    form.setValue('author', s.authors.join(', '));
                    form.setValue(
                      'pages',
                      s.pageCount && s.pageCount > 0 ? s.pageCount : undefined
                    );
                    form.setValue('summary', s.description || '');
                    if (s.thumbnail) {
                      form.setValue('coverUrl', s.thumbnail);
                      form.setValue('coverSource', 'api');
                    }
                    setAuthorSuggestions([]);
                    // re-enable after a short delay
                    window.setTimeout(() => setSuppressAuthorSuggestions(false), 350);
                  }}
                >
                  {s.thumbnail ? (
                    <div className="w-10 h-14 relative rounded overflow-hidden">
                      <Image
                        src={s.thumbnail}
                        alt={s.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                        quality={85}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-14 bg-border-color rounded" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">{s.title}</div>
                    <div className="text-xs text-text-muted">
                      {s.authors.join(', ')}
                      {s.language ? ` • ${String(s.language).toUpperCase()}` : ''}
                    </div>
                  </div>
                </li>
              ))}
              {authorSuggestionsLoading && (
                <li className="px-2 py-2 text-xs text-text-muted">Buscando livros do autor...</li>
              )}
              {authorSuggestionsError && (
                <li className="px-2 py-2 text-xs text-red-400">{authorSuggestionsError}</li>
              )}
            </ul>
          )}
          {/* inline status when list is empty */}
          {authorValue && authorValue.trim().length >= 3 && (
            <div className="mt-1 text-xs text-text-muted">
              {authorSuggestionsLoading && <span>Buscando livros do autor...</span>}
              {!authorSuggestionsLoading && authorSuggestionsError && (
                <span className="text-red-400">{authorSuggestionsError}</span>
              )}
              {!authorSuggestionsLoading && !authorSuggestionsError && authorSuggestions.length === 0 && (
                <span>Nenhum livro encontrado para este autor</span>
              )}
            </div>
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

        {/* Gerenciador de Capas */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase mb-3">
            Capa do Livro
          </label>
          <BookCoverUpload
            title={form.watch('title') || 'Sem título'}
            currentCoverUrl={form.watch('coverUrl')}
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

        {/* Hidden fields para coverSource */}
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
            className="w-full sm:flex-1 py-2 px-3 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium text-sm hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Criar Livro'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
