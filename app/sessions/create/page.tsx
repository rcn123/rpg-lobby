'use client';

import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { CreateSessionForm } from '@/components/CreateSessionForm';
import { useAuth } from '@/lib/auth-context';

export default function CreateSessionPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <Layout>
        {user && <CreateSessionForm user={user} />}
      </Layout>
    </AuthGuard>
  );
}