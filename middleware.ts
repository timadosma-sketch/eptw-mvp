import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn   = !!req.auth;
  const { pathname } = req.nextUrl;

  // Always allow auth API routes
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // Allow API routes through (they use server-side auth if needed)
  if (pathname.startsWith('/api/')) return NextResponse.next();

  // Redirect logged-in users away from login page
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
