'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AddToLibraryButton } from '@/components/AddToLibraryButton';
import { AddExternalBookModal } from '@/components/AddExternalBookModal';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    pageCount?: number;
    description?: string;
    publishedDate?: string;
    imageLinks?: {
      large?: string;
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
  };
  source: string;
}

export default function AutorPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const authorName = decodeURIComponent(params.author as string);

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [libraryBooks, setLibraryBooks] = useState<Set<string>>(new Set()); // Track books in library by externalId
  const [selectedBookForAdd, setSelectedBookForAdd] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(
          `/api/google-books?q=${encodeURIComponent(authorName)}&mode=author&maxResults=20`
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar livros');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          setBooks(data.items);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.error('Erro ao buscar livros do autor:', err);
        setError('Erro ao buscar livros. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [authorName]);

  // Fetch library books to check which are already added (if logged in)
  useEffect(() => {
    if (!session?.user) {
      setLibraryBooks(new Set());
      return;
    }

    const fetchLibraryBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) return;

        const data = await response.json();
        const externalIds = new Set<string>(
          data
            .filter((book: any) => book.externalId)
            .map((book: any) => book.externalId)
        );
        setLibraryBooks(externalIds);
      } catch (err) {
        console.error('Error fetching library books:', err);
      }
    };

    fetchLibraryBooks();
  }, [session]);

  return (
    <main className="min-h-screen bg-primary text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Livros de <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">{authorName}</span>
              </h1>
              <p className="text-text-muted text-sm">
                {isLoading
                  ? 'Carregando...'
                  : books.length === 0
                  ? 'Nenhum livro encontrado'
                  : `${books.length} livro${books.length !== 1 ? 's' : ''} encontrado${books.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded border border-border-color text-text-muted hover:text-secondary transition text-sm font-medium"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size={40} />
            <p className="text-text-muted mt-4">Buscando livros...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">Nenhum livro encontrado para &quot;{authorName}&quot;</p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 rounded bg-gradient-to-r from-cyan-500 to-green-500 text-white font-medium hover:brightness-110 transition"
            >
              Voltar para a Biblioteca
            </Link>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => {
              const coverUrl =
                book.volumeInfo.imageLinks?.large ||
                book.volumeInfo.imageLinks?.thumbnail ||
                book.volumeInfo.imageLinks?.smallThumbnail;

              // Build externalId for tracking
              const externalId = `google:${book.id}`;
              const isInLibrary = libraryBooks.has(externalId);

              // Transform to compatible format for AddToLibraryButton
              const externalBook = {
                id: book.id,
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors || [],
                description: book.volumeInfo.description,
                thumbnail: coverUrl,
                pageCount: book.volumeInfo.pageCount,
                publishedDate: book.volumeInfo.publishedDate,
                language: book.volumeInfo.language,
                source: book.source as 'google' | 'openlibrary',
              };

              return (
                <div
                  key={book.id}
                  className="bg-card border border-border-color rounded-lg overflow-hidden transition duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1 flex flex-col h-full"
                  title={book.volumeInfo.title}
                >
                  {/* Cover with add button */}
                  <div className="relative h-48 sm:h-56 bg-primary/50">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={book.volumeInfo.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <span className="text-4xl">📖</span>
                      </div>
                    )}
                    {session?.user && (
                      <AddToLibraryButton
                        book={externalBook}
                        isInLibrary={isInLibrary}
                        onAddClick={() => {
                          setSelectedBookForAdd(externalBook);
                          setIsAddModalOpen(true);
                        }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                      {book.volumeInfo.title}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-1 mb-2">
                      {book.volumeInfo.authors.join(', ')}
                    </p>
                    {book.volumeInfo.pageCount && (
                      <p className="text-xs text-text-muted mt-auto">
                        {book.volumeInfo.pageCount} páginas
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add to Library Modal - Rendered outside cards for proper z-index */}
      <AddExternalBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        book={selectedBookForAdd}
        onSaved={() => {
          setIsAddModalOpen(false);
          if (selectedBookForAdd) {
            const externalId = `google:${selectedBookForAdd.id}`;
            const newSet = new Set(libraryBooks);
            newSet.add(externalId);
            setLibraryBooks(newSet);
          }
          setSelectedBookForAdd(null);
        }}
      />
    </main>
  );
}
