'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { DashboardHeader } from '@/components/DashboardHeader';
import { BookCard } from '@/components/BookCard';
import { BookDetailsModal } from '@/components/BookDetailsModal';
import { EditBookModal } from '@/components/EditBookModal';
import { CreateBookModal } from '@/components/CreateBookModal';
import { BookInput } from '@/lib/validations';

interface Book extends BookInput {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  // Fetch books
  const url = activeFilter ? `/api/books?status=${activeFilter}` : '/api/books';

  const {
    data: books = [],
    mutate,
    isLoading,
  } = useSWR(status === 'authenticated' ? url : null, fetcher, { revalidateOnFocus: false });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
          <p className="mt-4 text-text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  // Filter and search books
  const filteredBooks = books.filter((book: Book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExpand = (id: number) => {
    const book = books.find((b: Book) => b.id === id);
    if (book) {
      setSelectedBook(book);
      setIsDetailsOpen(true);
    }
  };

  const handleEdit = (id: number) => {
    const book = books.find((b: Book) => b.id === id);
    if (book) {
      setBookToEdit(book);
      setIsEditOpen(true);
    }
  };

  const handleSaveBook = async (id: number, data: BookInput) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mutate();
        setIsEditOpen(false);
      }
    } catch (error) {
      console.error('Error saving book:', error);
      throw error;
    }
  };

  const handleCreateBook = async (data: BookInput) => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mutate();
        setIsCreateOpen(false);
      }
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este livro?')) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <DashboardHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bookCount={books.length}
        onAddBook={() => setIsCreateOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">
              Nenhum livro encontrado {searchQuery && `para "${searchQuery}"`}
            </p>
            <p className="text-text-muted text-sm mt-2">
              Comece a adicionar livros à sua biblioteca!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {filteredBooks.map((book: Book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                genre={book.genre}
                pages={book.pages}
                status={book.status}
                coverUrl={(book as any).coverUrl}
                onExpand={handleExpand}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <BookDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        book={selectedBook}
      />

      <EditBookModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        book={bookToEdit}
        onSave={handleSaveBook}
      />

      <CreateBookModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateBook}
      />
    </div>
  );
}
