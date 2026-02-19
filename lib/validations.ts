import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coinciden',
    path: ['confirmPassword'],
  });

export const bookSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  author: z.string().min(1, 'Autor é obrigatório'),
  genre: z.string().optional(),
  pages: z
    .number()
    .int()
    .positive('Páginas deve ser um número positivo')
    .optional()
    .or(z.literal(0)),
  currentPage: z
    .number()
    .int()
    .nonnegative('Página atual deve ser um número válido')
    .optional()
    .or(z.literal(0)),
  status: z.enum(['a-ler', 'lendo', 'lido']),
  summary: z.string().optional(),
  coverUrl: z.string().optional(),
  coverSource: z.enum(['api', 'upload', 'manual']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookInput = z.infer<typeof bookSchema>;
