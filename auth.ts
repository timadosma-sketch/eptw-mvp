import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        // Return shape that will be encoded into the JWT
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

  callbacks: {
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

  pages: {
    signIn: '/login',
  },

  secret: process.env.AUTH_SECRET,
});
