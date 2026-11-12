import DashboardShell from '@/components/DashboardShell';
import { requireRole } from '@/lib/auth';
import { TENANT_MENU } from '@/lib/constants';

export default async function TenantLayout({ children }) {
  const session = await requireRole('TENANT');
  return (
    <DashboardShell session={session} items={TENANT_MENU}>
      {children}
    </DashboardShell>
  );
}
