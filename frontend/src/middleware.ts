import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Decodes JWT payload in Next.js Edge runtime without external dependencies
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read access_token from cookies
  const accessTokenCookie = request.cookies.get('access_token');
  const token = accessTokenCookie?.value;
  
  let user: any = null;
  let isTokenValid = false;

  if (token) {
    const decoded = decodeJwt(token);
    if (decoded && decoded.exp * 1000 > Date.now()) {
      user = decoded;
      isTokenValid = true;
    }
  }

  // 1. Customer Protected Routes (/account/*)
  if (pathname.startsWith('/account')) {
    if (!isTokenValid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (user && user.role !== 'customer') {
      // If admin tries to access customer account pages, redirect to admin dashboard
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  // 2. Admin Protected Routes (/admin/* except /admin/login, /admin/forgot-password, /admin/reset-password)
  const isAdminGuestPath = 
    pathname === '/admin/login' || 
    pathname === '/admin/forgot-password' || 
    pathname === '/admin/reset-password';

  if (pathname.startsWith('/admin') && !isAdminGuestPath) {
    if (!isTokenValid || !user || user.role !== 'admin') {
      // If not logged in or role is not admin
      if (user && user.role === 'customer') {
        // Logged in customer tries to access admin -> redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Guest Only / Auth Pages (/login, /register)
  if (pathname === '/login' || pathname === '/register') {
    if (isTokenValid && user) {
      if (user.role === 'customer') {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  // 4. Admin Auth Pages (/admin/login, /admin/forgot-password, /admin/reset-password)
  if (isAdminGuestPath) {
    if (isTokenValid && user && user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (except if we want to restrict specific API routes, handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets/ (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api/auth).*)',
  ],
};
