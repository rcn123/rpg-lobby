import { NextRequest } from 'next/server';
import { withHandler } from '@/lib/api/handler';
import { supabaseAdmin } from '@/lib/supabase';
import { UsersService } from '@/lib/services/users';
import { UnauthorizedError, BadRequestError } from '@/lib/core/errors';

export const POST = withHandler(async (req: NextRequest) => {
  // Get JWT token from header
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError();
  }

  const token = authHeader.substring(7);

  // Validate token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError();
  }

  // Get target user ID from request body
  const body = await req.json();
  const { targetUserId } = body;

  if (!targetUserId) {
    throw new BadRequestError('Target user ID is required');
  }

  // Get our user record by JWT ID
  const dbUser = await UsersService.getUserByJwtId(user.id);

  if (!dbUser) {
    throw new UnauthorizedError();
  }

  // Set act_as in database
  const success = await UsersService.setActAs(dbUser.id, targetUserId);

  if (!success) {
    throw new BadRequestError('Failed to switch user');
  }

  // Return the new effective user
  const effectiveUser = await UsersService.getEffectiveUser(dbUser.id);

  if (!effectiveUser) {
    throw new BadRequestError('Failed to get effective user');
  }

  return effectiveUser;
});

export const DELETE = withHandler(async (req: NextRequest) => {
  // Get JWT token from header
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError();
  }

  const token = authHeader.substring(7);

  // Validate token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError();
  }

  // Get our user record by JWT ID
  const dbUser = await UsersService.getUserByJwtId(user.id);

  if (!dbUser) {
    throw new UnauthorizedError();
  }

  // Clear act_as in database
  await UsersService.setActAs(dbUser.id, null);

  // Return the original user
  return dbUser;
});