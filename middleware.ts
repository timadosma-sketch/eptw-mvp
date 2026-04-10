// Edge-safe middleware — imports only from auth.config (no bcrypt/Prisma).
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Use the edge-safe config — no Node.js-only modules in this bundle.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Skip Next.js internals, images, and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
