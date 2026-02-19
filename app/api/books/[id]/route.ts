import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { bookSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const bookId = parseInt(params.id);

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId,
      },
    });

    if (!book) {
      return NextResponse.json({ message: 'Livro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    return NextResponse.json({ message: 'Erro ao buscar livro' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const result = bookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const userId = parseInt((session.user as any).id);
    const bookId = parseInt(params.id);

    // Verify ownership
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId,
      },
    });

    if (!book) {
      return NextResponse.json({ message: 'Livro não encontrado' }, { status: 404 });
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...result.data,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Update book error:', error);
    return NextResponse.json({ message: 'Erro ao atualizar livro' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const bookId = parseInt(params.id);

    // Verify ownership
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId,
      },
    });

    if (!book) {
      return NextResponse.json({ message: 'Livro não encontrado' }, { status: 404 });
    }

    await prisma.book.delete({
      where: { id: bookId },
    });

    return NextResponse.json({ message: 'Livro deletado com sucesso' });
  } catch (error) {
    console.error('Delete book error:', error);
    return NextResponse.json({ message: 'Erro ao deletar livro' }, { status: 500 });
  }
}
