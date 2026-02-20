import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      // Formatar erros por campo
      const fieldErrors = result.error.flatten().fieldErrors;
      const errorMessages = Object.entries(fieldErrors)
        .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
        .join('; ');

      return NextResponse.json(
        {
          message: 'Dados inválidos',
          error: errorMessages,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, username, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Usuário já existe' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuário registrado com sucesso',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Erro ao registrar usuário' }, { status: 500 });
  }
}
