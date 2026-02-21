import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';

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
        { message: `Tipo de arquivo não suportado: ${file.type}. Use PNG, JPG, WEBP ou GIF.` },
        { status: 400 }
      );
    }

    // Validar tamanho (máx 10MB - aumentado pois vamos comprimir no frontend)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 10MB` },
        { status: 400 }
      );
    }

    // Gerar nome unico para o arquivo
    const randomName = randomBytes(8).toString('hex');
    const extension = EXTENSION_MAP[file.type] || 'jpg';
    const filename = `${randomName}.${extension}`;

    console.log('Upload iniciado:', { filename, size: file.size, type: file.type });

    const supabase = getSupabaseClient();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

    if (supabase) {
      try {
        const bytes = await file.arrayBuffer();
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(filename, Buffer.from(bytes), {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error('Supabase upload error:', error);
          return NextResponse.json(
            { message: `Erro ao fazer upload no Supabase: ${error.message}` },
            { status: 500 }
          );
        }

        const { data } = supabase.storage.from(bucketName).getPublicUrl(filename);
        console.log('Upload Supabase bem-sucedido:', data.publicUrl);
        return NextResponse.json({ url: data.publicUrl, filename }, { status: 200 });
      } catch (supabaseError) {
        console.error('Supabase exception:', supabaseError);
        return NextResponse.json(
          { message: `Exceção no Supabase: ${supabaseError instanceof Error ? supabaseError.message : 'Erro desconhecido'}` },
          { status: 500 }
        );
      }
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Retornar URL pública
    const publicUrl = `/uploads/${filename}`;
    console.log('Upload local bem-sucedido:', publicUrl);

    return NextResponse.json({ url: publicUrl, filename }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload';
    return NextResponse.json({ message }, { status: 500 });
  }
}
