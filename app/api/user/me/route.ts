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

  // First, get our user record by JWT ID
  let dbUser = await UsersService.getUserByJwtId(user.id);

  // If user doesn't exist in our database, create them
  if (!dbUser) {
    dbUser = await UsersService.createUser({
      jwtId: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      authProvider: 'facebook', // Default for now
      authProviderId: user.user_metadata?.provider_id,
      role: 'Player', // Default role
    });

    if (!dbUser) {
      throw new UnauthorizedError();
    }
  }

  // Then get effective user (checks act_as column)
  const effectiveUser = await UsersService.getEffectiveUser(dbUser.id);

  if (!effectiveUser) {
    throw new UnauthorizedError();
  }

  return effectiveUser;
});