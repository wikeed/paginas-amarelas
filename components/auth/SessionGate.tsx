'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SessionGateProps {
  children: ReactNode;
}

export function SessionGate({ children }: SessionGateProps) {
  const { status } = useSession();

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

  return <>{children}</>;
}
