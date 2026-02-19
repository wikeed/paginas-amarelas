'use client';

import { useState } from 'react';
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
      loginForm.setValue('username', data.username);
      loginForm.setValue('password', data.password);
      setError('Registrado com sucesso! Faça login com suas credenciais.');
    } catch (err) {
      setError('Erro ao registrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 px-4 rounded font-semibold transition ${
            isLogin
              ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
              : 'bg-transparent border border-border-color text-text-muted hover:text-white'
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 px-4 rounded font-semibold transition ${
            !isLogin
              ? 'bg-gradient-to-r from-cyan-400 to-green-400 text-white'
              : 'bg-transparent border border-border-color text-text-muted hover:text-white'
          }`}
        >
          Registrar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      {isLogin ? (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-2">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              {...loginForm.register('username')}
              className="w-full px-4 py-2 bg-transparent border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary"
            />
            {loginForm.formState.errors.username && (
              <p className="mt-1 text-xs text-red-400">
                {loginForm.formState.errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              {...loginForm.register('password')}
              className="w-full px-4 py-2 bg-transparent border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary"
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
            className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-2">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              {...registerForm.register('name')}
              className="w-full px-4 py-2 bg-transparent border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary"
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
              className="block text-sm font-medium text-text-muted mb-2"
            >
              Usuário
            </label>
            <input
              id="register-username"
              type="text"
              placeholder="Escolha um usuário"
              {...registerForm.register('username')}
              className="w-full px-4 py-2 bg-transparent border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary"
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
              className="block text-sm font-medium text-text-muted mb-2"
            >
              Senha
            </label>
            <input
              id="register-password"
              type="password"
              placeholder="Digite sua senha"
              {...registerForm.register('password')}
              className="w-full px-4 py-2 bg-transparent border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary"
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
              className="block text-sm font-medium text-text-muted mb-2"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              {...registerForm.register('confirmPassword')}
              className="w-full px-4 py-2 bg-transparent border border-border-color rounded text-white placeholder-text-muted focus:outline-none focus:border-secondary"
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
            className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : 'Registrar'}
          </button>
        </form>
      )}
    </div>
  );
}
