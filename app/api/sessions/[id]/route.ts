import { NextRequest } from 'next/server';
import { sessionsService } from '@/lib/services/sessions';
import { withHandler } from '@/lib/api/handler';
import { requireUser } from '@/lib/api/auth-guard';
import { NotFoundError, BadRequestError } from '@/lib/core/errors';

export const GET = withHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const result = await sessionsService.getSession(params.id);
  if (!result.success) throw new NotFoundError(result.error || 'Session not found');
  return result.data;
});

export const PUT = withHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  await requireUser(); // Ensure user is authenticated
  
  const result = await sessionsService.updateSession({ id: params.id, ...body });
  if (!result.success) throw new BadRequestError(result.error || 'Update failed');
  return result.data;
});

export const DELETE = withHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await requireUser(); // Ensure user is authenticated
  
  const result = await sessionsService.deleteSession(params.id);
  if (!result.success) throw new BadRequestError(result.error || 'Delete failed');
  return { success: true };
});
