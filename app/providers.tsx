'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { SessionGate } from '@/components/auth/SessionGate';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionGate>{children}</SessionGate>
    </SessionProvider>
  );
}
