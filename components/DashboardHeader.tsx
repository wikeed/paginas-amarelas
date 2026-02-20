'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Avatar } from '@/components/Avatar';

interface DashboardHeaderProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bookCounts: {
    total: number;
    aLer: number;
    lendo: number;
    lido: number;
  };
  onAddBook?: () => void;
}

export function DashboardHeader({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  bookCounts,
  onAddBook,
}: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const username = (session?.user as { username?: string } | undefined)?.username;
  const fullName = session?.user?.name;

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) return;
        const data = await response.json();
        setProfileImage(data.image ?? null);
      } catch (error) {
        console.error('Erro ao buscar imagem de perfil:', error);
      }
    };

    fetchProfileImage();
  }, []);

  // Sincroniza search local com pai quando searchQuery muda
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Link
            href="/feed"
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent hover:opacity-90 transition"
          >
            📖 Páginas Amarelas
          </Link>
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded border border-border-color text-text-muted hover:text-white transition max-w-[170px] sm:max-w-none"
              >
                <Avatar
                  name={username || 'Usuário'}
                  image={profileImage || session?.user?.image || null}
                  size="sm"
                />
                <span className="hidden sm:inline truncate">{username || 'Usuário'}</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-primary border border-border-color rounded shadow-lg z-50">
                  <div className="p-3 border-b border-border-color text-sm text-text-muted">
                    {fullName || username || 'Usuário'}
                  </div>
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-secondary hover:bg-secondary/10 transition text-sm"
                  >
                    👤 Meu Perfil
                  </button>
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
              Todos{activeFilter === null && ` (${bookCounts.total})`}
            </button>
            <button
              onClick={() => onFilterChange('a-ler')}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                activeFilter === 'a-ler'
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                  : 'border border-border-color text-text-muted hover:text-white'
              }`}
            >
              A ler{activeFilter === 'a-ler' && ` (${bookCounts.aLer})`}
            </button>
            <button
              onClick={() => onFilterChange('lendo')}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                activeFilter === 'lendo'
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                  : 'border border-border-color text-text-muted hover:text-white'
              }`}
            >
              Lendo{activeFilter === 'lendo' && ` (${bookCounts.lendo})`}
            </button>
            <button
              onClick={() => onFilterChange('lido')}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                activeFilter === 'lido'
                  ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
                  : 'border border-border-color text-text-muted hover:text-white'
              }`}
            >
              Lido{activeFilter === 'lido' && ` (${bookCounts.lido})`}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              href="/feed"
              className="px-4 py-2 rounded border border-border-color text-text-muted hover:text-secondary hover:border-secondary transition text-sm font-medium text-center whitespace-nowrap"
            >
              Feed de Atividade
            </Link>
            <button
              onClick={onAddBook}
              className="px-4 py-2 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium text-sm hover:brightness-110 transition whitespace-nowrap"
            >
              + Novo Livro
            </button>
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
      </div>
    </header>
  );
}
