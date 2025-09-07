import { NextRequest } from 'next/server';
import { withHandler } from '@/lib/api/handler';
import { requireUser } from '@/lib/api/auth-guard';

export const GET = withHandler(async (_req: NextRequest) => {
  const user = await requireUser();
  return user;
});
