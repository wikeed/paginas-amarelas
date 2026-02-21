import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { bookSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const books = await prisma.book.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    return NextResponse.json({ message: 'Erro ao buscar livros' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const result = bookSchema.safeParse(body);
    if (!result.success) {
      console.error('Validation error:', result.error);
      return NextResponse.json(
        { message: 'Dados inválidos', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const userId = parseInt((session.user as any).id);
    console.log('Creating book for user:', userId, 'Data:', result.data);

    // Check for duplicate externalId if provided
    if (result.data.externalId) {
      const existing = await prisma.book.findFirst({
        where: {
          externalId: result.data.externalId,
          userId,
        },
      });

      if (existing) {
        return NextResponse.json(
          { message: 'Este livro já está na sua biblioteca' },
          { status: 409 }
        );
      }
    }

    const book = await prisma.book.create({
      data: {
        ...result.data,
        userId,
      },
    });

    console.log('Book created successfully:', book.id);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json(
      { 
        message: 'Erro ao criar livro', 
        error: String(error),
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
