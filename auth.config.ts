// Edge-safe NextAuth config — no Node.js-only APIs (no bcrypt, no Prisma)
// Used by middleware.ts which runs in the Vercel Edge Runtime.
// The full config (with bcryptjs + DB) lives in auth.ts.

import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user;
      const { pathname } = nextUrl;

      // Always allow auth API and static assets
      if (pathname.startsWith('/api/auth')) return true;
      // Allow API routes (they handle their own auth if needed)
      if (pathname.startsWith('/api/'))     return true;
      // Login page: always accessible
      if (pathname === '/login')            return true;

      // Admin section requires PLANT_OPS_MANAGER or SYSTEM_ADMIN
      if (pathname.startsWith('/admin')) {
        const role = (auth?.user as Record<string, unknown> | undefined)?.role as string | undefined;
        return role === 'PLANT_OPS_MANAGER' || role === 'SYSTEM_ADMIN';
      }

      // Everything else requires a session
      return isLoggedIn;
    },

    jwt({ token, user }) {
      if (user) {
        const u = user as Record<string, unknown>;
        token.id             = u.id;
        token.role           = u.role;
        token.employeeId     = u.employeeId;
        token.department     = u.department;
        token.company        = u.company;
        token.avatarInitials = u.avatarInitials;
        token.isContractor   = u.isContractor;
        token.certifications = u.certifications;
        token.phone          = u.phone;
      }
      return token;
    },

    session({ session, token }) {
      const u = session.user as unknown as Record<string, unknown>;
      u.id             = token.id             as string;
      u.role           = token.role;
      u.employeeId     = token.employeeId;
      u.department     = token.department;
      u.company        = token.company;
      u.avatarInitials = token.avatarInitials;
      u.isContractor   = token.isContractor;
      u.certifications = token.certifications;
      u.phone          = token.phone;
      return session;
    },
  },

  providers: [], // Populated in auth.ts (Node.js runtime only)
  secret: process.env.AUTH_SECRET,
};
