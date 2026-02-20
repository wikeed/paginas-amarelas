'use client';

import { useState, useMemo, useRef } from 'react';
import { searchBooks } from '@/lib/text';
import { PublicBookCard } from './PublicBookCard';
import { BookDetailsModal } from '@/components/BookDetailsModal';

interface PublicBook {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  pages?: number | null;
  currentPage?: number | null;
  status: string;
  coverUrl?: string | null;
  summary?: string | null;
}

interface PublicBookGridProps {
  initialBooks: PublicBook[];
  username: string;
}

export function PublicBookGrid({ initialBooks, username }: PublicBookGridProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<PublicBook | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrar por status
  const filteredByStatus = useMemo(() => {
    return activeFilter
      ? initialBooks.filter((book) => book.status === activeFilter)
      : initialBooks;
  }, [initialBooks, activeFilter]);

  // Calcular contagens
  const bookCounts = useMemo(
    () => ({
      total: initialBooks.length,
      aLer: initialBooks.filter((b) => b.status === 'a-ler').length,
      lendo: initialBooks.filter((b) => b.status === 'lendo').length,
      lido: initialBooks.filter((b) => b.status === 'lido').length,
    }),
    [initialBooks]
  );

  // Buscar e filtrar
  const filteredBooks = useMemo(
    () => searchBooks(filteredByStatus, searchQuery),
    [filteredByStatus, searchQuery]
  );

  const handleSearchChange = (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 400);
  };

  const handleExpand = (id: number) => {
    const book = filteredBooks.find((b) => b.id === id);
    if (book) {
      setSelectedBook(book);
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      {/* Filtros e Busca */}
      <div className="bg-primary/95 backdrop-blur border-b border-border-color sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  activeFilter === null
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                    : 'border border-border-color text-text-muted hover:text-white'
                }`}
              >
                Todos{activeFilter === null && ` (${bookCounts.total})`}
              </button>
              <button
                onClick={() => setActiveFilter('a-ler')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  activeFilter === 'a-ler'
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                    : 'border border-border-color text-text-muted hover:text-white'
                }`}
              >
                A ler{activeFilter === 'a-ler' && ` (${bookCounts.aLer})`}
              </button>
              <button
                onClick={() => setActiveFilter('lendo')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  activeFilter === 'lendo'
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                    : 'border border-border-color text-text-muted hover:text-white'
                }`}
              >
                Lendo{activeFilter === 'lendo' && ` (${bookCounts.lendo})`}
              </button>
              <button
                onClick={() => setActiveFilter('lido')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  activeFilter === 'lido'
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                    : 'border border-border-color text-text-muted hover:text-white'
                }`}
              >
                Lidos{activeFilter === 'lido' && ` (${bookCounts.lido})`}
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar livro..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-primary border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary text-sm"
              />
              <span className="absolute right-3 top-2.5 text-text-muted">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Livros */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">
              Nenhum livro encontrado {searchQuery && `para "${searchQuery}"`}
            </p>
            {initialBooks.length > 0 && (
              <p className="text-text-muted text-sm mt-2">Tente ajustar os filtros ou a busca.</p>
            )}
            {initialBooks.length === 0 && (
              <p className="text-text-muted text-sm mt-2">
                {username} ainda não tem livros em sua biblioteca.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {filteredBooks.map((book) => (
              <PublicBookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                genre={book.genre}
                pages={book.pages}
                currentPage={book.currentPage}
                status={book.status}
                coverUrl={book.coverUrl}
                onExpand={handleExpand}
              />
            ))}
          </div>
        )}
      </main>

      {/* Details Modal */}
      <BookDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        book={selectedBook}
      />
    </>
  );
}
