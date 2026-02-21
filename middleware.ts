import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = ['/', '/api/auth'];

// Rotas protegidas (requerem autenticação)
const PROTECTED_ROUTES = ['/dashboard', '/feed', '/profile', '/u'];

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;

    // Se é rota protegida e não tem token, redirecionar para login
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Se está logado e tenta acessar a home (página de login), redirecionar para dashboard
    if (pathname === '/' && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Rotas públicas sempre autorizam
        if (pathname === '/' || pathname.startsWith('/api/auth')) {
          return true;
        }

        // Rotas protegidas precisam de token
        const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
        if (isProtectedRoute) {
          return !!token;
        }

        // Outras rotas sempre autorizam
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
