import prisma from '@/lib/prisma';
import { FeedList } from '@/components/feed/FeedList';
import Link from 'next/link';

interface FeedPageProps {
  searchParams: {
    cursor?: string;
  };
}

const ITEMS_PER_PAGE = 10;

export const metadata = {
  title: 'Feed | Páginas Amarelas',
  description:
    'Acompanhe a atividade recente de livros adicionados e atualizados por outros usuários.',
};

export const revalidate = 30; // Revalidate a cada 30 segundos para mostrar atividade recente

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const cursor = searchParams.cursor ? parseInt(searchParams.cursor) : undefined;

  // Buscar livros com fallback por updatedAt
  // Query otimizada: uma única consulta com select específico
  const books = await prisma.book.findMany({
    take: ITEMS_PER_PAGE + 1, // +1 para saber se há mais
    ...(cursor && { skip: 1, cursor: { id: cursor } }), // cursor pagination
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      title: true,
      author: true,
      coverUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      genre: true,
      pages: true,
      currentPage: true,
      summary: true,
      user: {
        select: {
          username: true,
          name: true,
          image: true,
          // Não incluir email, password ou outros dados sensíveis
        },
      },
    },
  });

  const hasMore = books.length > ITEMS_PER_PAGE;
  const items = books.slice(0, ITEMS_PER_PAGE);
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegacao do feed */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <Link
            href="/feed"
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent hover:opacity-90 transition"
          >
            📖 Páginas Amarelas
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded border border-border-color text-text-muted hover:text-secondary hover:border-secondary transition text-sm font-medium text-center"
          >
            Minha Biblioteca
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Feed de Atividade</h1>
          <p className="text-text-muted">
            Acompanhe os livros adicionados e atualizados por usuários da comunidade
          </p>
        </div>

        {/* Feed */}
        <FeedList initialItems={items} initialHasMore={hasMore} initialNextCursor={nextCursor} />
      </div>
    </div>
  );
}
