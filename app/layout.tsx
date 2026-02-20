import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Páginas Amarelas',
  description: 'Gerencie sua biblioteca pessoal de livros',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-primary text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
