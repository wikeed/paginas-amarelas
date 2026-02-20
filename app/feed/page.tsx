import prisma from '@/lib/prisma';
import { FeedPageClient } from '@/components/feed/FeedPageClient';

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
    <FeedPageClient
      initialItems={items}
      initialHasMore={hasMore}
      initialNextCursor={nextCursor}
    />
  );
}
