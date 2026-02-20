import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { PublicProfileHeader } from '@/components/profile/PublicProfileHeader';
import { PublicProfileStats } from '@/components/profile/PublicProfileStats';
import { PublicBookGrid } from '@/components/books/PublicBookGrid';

interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = params;

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username.toLowerCase(),
        mode: 'insensitive',
      },
    },
    select: {
      name: true,
    },
  });

  if (!user) {
    return {
      title: 'Usuário não encontrado',
    };
  }

  return {
    title: `${user.name || username} - Páginas Amarelas`,
    description: `Biblioteca de livros de ${user.name || username}`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = params;

  // Buscar usuário com seus livros
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username.toLowerCase(),
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      books: {
        select: {
          id: true,
          title: true,
          author: true,
          genre: true,
          pages: true,
          currentPage: true,
          status: true,
          coverUrl: true,
          summary: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calcular estatísticas
  const stats = {
    total: user.books.length,
    aLer: user.books.filter((b) => b.status === 'a-ler').length,
    lendo: user.books.filter((b) => b.status === 'lendo').length,
    lido: user.books.filter((b) => b.status === 'lido').length,
  };

  return (
    <div className="min-h-screen bg-primary">
      <PublicProfileHeader username={user.username} name={user.name} image={user.image} />

      <PublicProfileStats
        total={stats.total}
        aLer={stats.aLer}
        lendo={stats.lendo}
        lido={stats.lido}
      />

      <PublicBookGrid initialBooks={user.books} username={user.username} />
    </div>
  );
}
