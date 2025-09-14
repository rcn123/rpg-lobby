'use client';

import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { CreateSessionForm } from '@/components/CreateSessionForm';
import { useAuth } from '@/lib/auth-context';

function CreateSessionContent() {
  const { user } = useAuth();

  return (
    <Layout>
      {user && <CreateSessionForm user={user} />}
    </Layout>
  );
}

export default function CreateSessionPage() {
  return (
    <AuthGuard>
      <CreateSessionContent />
    </AuthGuard>
  );
}