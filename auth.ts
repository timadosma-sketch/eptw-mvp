// Full NextAuth config — Node.js runtime only (uses bcryptjs + Prisma).
// Do NOT import this from middleware.ts.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name,
          role:           user.role,
          employeeId:     user.employeeId,
          department:     user.department,
          company:        user.company,
          avatarInitials: user.avatarInitials,
          isContractor:   user.isContractor,
          certifications: user.certifications,
          phone:          user.phone,
        };
      },
    }),
  ],
});
