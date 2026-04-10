'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store/useAppStore';
import type { User, UserRole } from '@/lib/types';

/**
 * Reads the NextAuth session and hydrates the Zustand currentUser store.
 * Mounted once in layout — no visible output.
 */
export function SessionSync() {
  const { data: session } = useSession();
  const setCurrentUser    = useAppStore(s => s.setCurrentUser);

  useEffect(() => {
    if (!session?.user) return;
    const u = session.user as Record<string, unknown>;
    setCurrentUser({
      id:             String(u.id             ?? ''),
      name:           String(u.name           ?? ''),
      email:          String(u.email          ?? ''),
      role:           (u.role as UserRole)    ?? 'PERMIT_REQUESTER',
      employeeId:     String(u.employeeId     ?? ''),
      department:     String(u.department     ?? ''),
      company:        String(u.company        ?? ''),
      avatarInitials: String(u.avatarInitials ?? ''),
      isContractor:   Boolean(u.isContractor),
      certifications: Array.isArray(u.certifications) ? u.certifications as string[] : [],
      phone:          String(u.phone          ?? ''),
    } satisfies User);
  }, [session, setCurrentUser]);

  return null;
}
