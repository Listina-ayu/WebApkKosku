import DashboardShell from '@/components/DashboardShell';
import { requireRole } from '@/lib/auth';
import { OWNER_MENU } from '@/lib/constants';

export default async function OwnerLayout({ children }) {
  const session = await requireRole('OWNER');
  return (
    <DashboardShell session={session} items={OWNER_MENU}>
      {children}
    </DashboardShell>
  );
}
