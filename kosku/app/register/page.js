import { redirect } from 'next/navigation';
import PublicNav from '@/components/PublicNav';
import { RegisterForm } from '@/components/AuthForms';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(session.role === 'OWNER' ? '/owner' : '/tenant');

  return (
    <>
      <PublicNav />
      <main className="flex justify-center px-4 py-12">
        <RegisterForm />
      </main>
    </>
  );
}
