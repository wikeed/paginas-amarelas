'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SessionGateProps {
  children: ReactNode;
}

const PROTECTED_ROUTES = ['/dashboard', '/feed', '/profile', '/u'];

export function SessionGate({ children }: SessionGateProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Verificar se a rota atual é protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    // Se está em rota protegida e sessão está desautenticada, redirecionar para login
    if (isProtectedRoute && status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, isProtectedRoute, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border border-border-color bg-card/80 px-5 py-3"
        >
          <LoadingSpinner size={20} />
          <span className="text-sm text-text-muted">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se está em rota protegida sem autenticação, não renderizar (será redirecionado)
  if (isProtectedRoute && status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
