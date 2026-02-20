import prisma from '@/lib/prisma';
import { FeedList } from '@/components/feed/FeedList';

interface FeedPageProps {
  searchParams: {
    cursor?: string;
  };
}

const ITEMS_PER_PAGE = 10;

export const metadata = {
  title: 'Feed | Páginas Amarelas',
  description: 'Acompanhe a atividade recente de livros adicionados e atualizados por outros usuários.',
};

export const revalidate = 30; // Revalidate a cada 30 segundos para mostrar atividade recente

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const cursor = searchParams.cursor ? parseInt(searchParams.cursor) : undefined;

  // Buscar livros com fallback por updatedAt
  // Query otimizada: uma única consulta com select específico
  const books = await prisma.book.findMany({
    take: ITEMS_PER_PAGE + 1, // +1 para saber se há mais
    ...(cursor && { skip: 1, cursor: { id: cursor } }), // cursor pagination
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      author: true,
      coverUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Feed de Atividade
          </h1>
          <p className="text-text-muted">
            Acompanhe os livros adicionados e atualizados por usuários da comunidade
          </p>
        </div>

        {/* Feed */}
        <FeedList items={items} hasMore={hasMore} nextCursor={nextCursor} />
      </div>
    </div>
  );
}
