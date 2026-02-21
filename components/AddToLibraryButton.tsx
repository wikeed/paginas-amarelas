'use client';

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

interface AddToLibraryButtonProps {
  book: ExternalBook;
  isInLibrary?: boolean;
  onAddClick?: () => void;
}

export function AddToLibraryButton({
  book,
  isInLibrary = false,
  onAddClick,
}: AddToLibraryButtonProps) {
  const { data: session } = useSession();

  // Se não estiver logado ou livro já está na biblioteca, não mostrar
  if (!session?.user || isInLibrary) {
    return (
      <div className="absolute top-2 right-2 backdrop-blur-sm bg-black/60 px-2 py-1.5 rounded border border-white/20 shadow-lg">
        <span className="text-lg text-green-400" title="Já está na sua biblioteca">
          ✓
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAddClick?.();
      }}
      className="absolute top-2 right-2 backdrop-blur-sm bg-yellow-500/80 hover:bg-yellow-500 text-white px-2 py-1.5 rounded border border-yellow-600/50 shadow-lg transition duration-200 text-lg leading-none font-bold"
      title="Adicionar à sua biblioteca"
    >
      +
    </button>
  );
}
