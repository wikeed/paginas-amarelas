'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-primary border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={session ? '/dashboard' : '/'}
            className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent hover:opacity-80 transition"
          >
            📖 Páginas Amarelas
          </Link>

          {/* Menu Links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/feed"
              className="text-text-muted hover:text-secondary transition text-sm font-medium"
            >
              Feed de Atividade
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="text-text-muted hover:text-secondary transition text-sm font-medium"
              >
                Minha Biblioteca
              </Link>
            ) : null}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="sm:hidden">
            <Link
              href="/feed"
              className="text-text-muted hover:text-secondary transition text-sm"
            >
              Feed
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
