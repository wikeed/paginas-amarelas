import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/profile
 * Retorna dados do usuário logado + estatísticas de livros
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    // Contar livros por status
    const stats = await Promise.all([
      prisma.book.count({ where: { userId, status: 'a-ler' } }),
      prisma.book.count({ where: { userId, status: 'lendo' } }),
      prisma.book.count({ where: { userId, status: 'lido' } }),
    ]);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: (user as any).image,
      stats: {
        aLer: stats[0],
        lendo: stats[1],
        lido: stats[2],
        total: stats[0] + stats[1] + stats[2],
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ message: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

/**
 * PATCH /api/profile
 * Atualiza name, image do usuário logado
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const body = await request.json();

    const { name, image } = body;

    // Validar entrada
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ message: 'Nome deve ser texto' }, { status: 400 });
    }

    if (image !== undefined && (typeof image !== 'string' || image.length === 0)) {
      return NextResponse.json({ message: 'Imagem deve ser URL válida' }, { status: 400 });
    }

    // Atualizar usuário
    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (image !== undefined) dataToUpdate.image = image;

    console.log('Atualizando usuário:', { userId, dataToUpdate });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    console.log('Usuário atualizado com sucesso:', updatedUser);

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      image: (updatedUser as any).image,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Erro ao atualizar perfil', error: String(error) }, { status: 500 });
  }
}
