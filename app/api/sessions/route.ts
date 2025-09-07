import { NextRequest } from 'next/server';
import { sessionsService } from '@/lib/services/sessions';
import { withHandler } from '@/lib/api/handler';
import { requireUser } from '@/lib/api/auth-guard';
import { BadRequestError } from '@/lib/core/errors';

export const POST = withHandler(async (req: NextRequest) => {
  const body = await req.json();
  const user = await requireUser(req);
  
  const result = await sessionsService.createSession(body, user.id);
  if (!result.success) throw new BadRequestError(result.error || 'Failed to create session');
  return result.data;
});

export const GET = withHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const filters = {
    gameSystem: searchParams.get('gameSystem') || undefined,
    isOnline: searchParams.get('isOnline') === 'true',
  };
  
  const result = await sessionsService.getSessions(filters);
  if (!result.success) throw new BadRequestError(result.error || 'Failed to fetch sessions');
  return result.data;
});
