import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Tipos MIME aceitados para imagens
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Extensões permitidas
const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo - apenas MIME types permitidos
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `Tipo de arquivo não suportado. Use PNG, JPG, WEBP ou GIF.` },
        { status: 400 }
      );
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
    }

    // Gerar nome único para o arquivo
    const randomName = randomBytes(8).toString('hex');
    const extension = EXTENSION_MAP[file.type] || 'jpg';
    const filename = `${randomName}.${extension}`;

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Retornar URL pública
    const publicUrl = `/uploads/${filename}`;

    console.log(`✅ Upload realizado: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl, filename }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Erro ao fazer upload' }, { status: 500 });
  }
}
