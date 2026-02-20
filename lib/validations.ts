import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    username: z.string().trim().toLowerCase().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coinciden',
    path: ['confirmPassword'],
  });

export const bookSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório'),
    author: z.string().min(1, 'Autor é obrigatório'),
    genre: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === '' ? undefined : v)),
    pages: z
      .union([
        z.number().int().positive('Páginas deve ser um número positivo'),
        z.undefined(),
        z.null(),
      ])
      .optional()
      .transform((v) => (v === null || v === 0 ? undefined : v)),
    currentPage: z
      .union([
        z.number().int().nonnegative('Página atual deve ser um número válido'),
        z.undefined(),
        z.null(),
      ])
      .optional()
      .transform((v) => (v === null || v === 0 ? undefined : v)),
    status: z.enum(['a-ler', 'lendo', 'lido']),
    summary: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === '' ? undefined : v)),
    coverUrl: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === '' ? undefined : v)),
    coverSource: z
      .enum(['api', 'upload', 'manual'])
      .optional()
      .nullable()
      .transform((v) => v ?? undefined),
  })
  .refine(
    (data) => {
      // Se tiver páginas e página atual, currentPage não pode ser > pages
      if (data.pages && data.currentPage && data.currentPage > data.pages) {
        return false;
      }
      return true;
    },
    {
      message: 'Página atual não pode ser maior que o total de páginas',
      path: ['currentPage'],
    }
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookInput = z.infer<typeof bookSchema>;
