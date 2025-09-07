import { NextRequest } from 'next/server';
import { UsersService } from '@/lib/services/users';
import { withHandler } from '@/lib/api/handler';
import { NotFoundError } from '@/lib/core/errors';

export const GET = withHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const profile = await UsersService.getUserById(params.id);
  if (!profile) throw new NotFoundError('User not found');
  return profile;
});
