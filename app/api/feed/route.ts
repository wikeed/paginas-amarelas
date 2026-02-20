import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const cursorParam = request.nextUrl.searchParams.get('cursor');
    const cursor = cursorParam ? parseInt(cursorParam) : undefined;

    const books = await prisma.book.findMany({
      take: ITEMS_PER_PAGE + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        author: true,
        genre: true,
        pages: true,
        currentPage: true,
        summary: true,
        coverUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const hasMore = books.length > ITEMS_PER_PAGE;
    const items = books.slice(0, ITEMS_PER_PAGE);
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return NextResponse.json({ items, hasMore, nextCursor });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ message: 'Erro ao buscar feed' }, { status: 500 });
  }
}
