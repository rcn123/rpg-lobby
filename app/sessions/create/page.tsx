import { redirect } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { getServerUser } from '@/lib/auth-server';
import { CreateSessionForm } from '@/components/CreateSessionForm';

export default async function CreateSessionPage() {
  // Check authentication server-side
  const user = await getServerUser();
  
  if (!user) {
    redirect('/');
  }

  return (
    <Layout>
      <CreateSessionForm user={user} />
    </Layout>
  );
}