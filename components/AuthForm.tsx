'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/validations';
import { signIn } from 'next-auth/react';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (isLoginTab: boolean) => {
    setIsLogin(isLoginTab);
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', password: '', confirmPassword: '' },
  });

  const onLoginSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Usuário ou senha incorretos');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Exibir mensagem de erro específica se disponível
        const errorMessage = result.error || result.message || 'Erro ao registrar';
        setError(errorMessage);
        return;
      }

      setIsLogin(true);
      loginForm.setValue('username', result?.user?.username ?? data.username);
      loginForm.setValue('password', data.password);
      setError('Registrado com sucesso! Faça login com suas credenciais.');
    } catch (err) {
      setError('Erro ao registrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[560px] flex flex-col">
      {/* Título - Header */}
      <div className="flex justify-center mb-8 sm:mb-12 py-4 flex-shrink-0">
        <h1
          className="
    text-3xl sm:text-5xl md:text-6xl
    font-bold
    leading-relaxed
    pb-2
    text-center break-words
    bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500
    bg-clip-text text-transparent
    drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]
  "
        >
          Páginas Amarelas
        </h1>
      </div>

      {/* Tabs - Fixas */}
      <div className="flex gap-3 mb-6 flex-shrink-0">
        <button
          onClick={() => handleTabChange(true)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            isLogin
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105'
              : 'bg-slate-800/60 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => handleTabChange(false)}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            !isLogin
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-105'
              : 'bg-slate-800/60 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          Registrar
        </button>
      </div>

      {/* Área de Conteúdo */}
      <div ref={scrollAreaRef} className="flex-1">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                {...loginForm.register('username')}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              {loginForm.formState.errors.username && (
                <p className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                {...loginForm.register('password')}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                {...registerForm.register('name')}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              {registerForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-username"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Usuário
              </label>
              <input
                id="register-username"
                type="text"
                placeholder="Escolha um usuário"
                {...registerForm.register('username')}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              {registerForm.formState.errors.username && (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Senha
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="Digite sua senha"
                {...registerForm.register('password')}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                {...registerForm.register('confirmPassword')}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Carregando...' : 'Registrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
