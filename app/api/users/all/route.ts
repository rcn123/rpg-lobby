import { NextRequest } from 'next/server';
import { withHandler } from '@/lib/api/handler';
import { supabaseAdmin } from '@/lib/supabase';
import { UsersService } from '@/lib/services/users';
import { UnauthorizedError } from '@/lib/core/errors';

export const GET = withHandler(async (req: NextRequest) => {
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

  // Get all users from database
  const users = await UsersService.getAllUsers();

  return users;
});