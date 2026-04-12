import { Suspense } from 'react';
import { PermitsPage } from '@/components/permits/PermitsPage';

export const metadata = { title: 'Permit Register — ePTW' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PermitsPage />
    </Suspense>
  );
}
