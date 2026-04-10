import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { CreatePermitWizard } from '@/components/permits/CreatePermitWizard';
import { GlobalGasTestModal } from '@/components/gas/GlobalGasTestModal';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: 'ePTW Platform — Enterprise Permit to Work',
  description: 'Electronic Permit to Work system for Oil & Gas — IEC 62443 · Zero Trust · ISA-95',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23F59E0B'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='18' font-weight='bold' fill='black'>P</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <AppShell>
            {children}
            {/* Global overlays */}
            <CreatePermitWizard />
            <GlobalGasTestModal />
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
