'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface DashboardHeaderProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bookCount: number;
  onAddBook?: () => void;
}

const filters = [
  { value: 'a-ler', label: 'A ler' },
  { value: 'lendo', label: 'Lendo' },
  { value: 'lido', label: 'Lido' },
];

export function DashboardHeader({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  bookCount,
  onAddBook,
}: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Sincroniza search local com pai quando searchQuery muda
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce: aguarda 400ms de inatividade antes de chamar onSearchChange
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 400);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Páginas Amarelas
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onAddBook}
              className="px-4 py-2 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium text-sm hover:brightness-110 transition"
            >
              + Novo Livro
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded border border-border-color text-text-muted hover:text-white transition"
              >
                👤 {session?.user?.name || 'Usuário'}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-primary border border-border-color rounded shadow-lg z-50">
                  <div className="p-3 border-b border-border-color text-sm text-text-muted">
                    {session?.user?.email || session?.user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition text-sm"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onFilterChange(null)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                activeFilter === null
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                  : 'border border-border-color text-text-muted hover:text-white'
              }`}
            >
              Todos ({bookCount})
            </button>
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  activeFilter === filter.value
                    ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                    : 'border border-border-color text-text-muted hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar livro..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-primary border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary text-sm"
            />
            <span className="absolute right-3 top-2.5 text-text-muted">🔍</span>
          </div>
        </div>
      </div>
    </header>
  );
}
