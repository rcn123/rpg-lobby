import { NextRequest } from 'next/server';
import { UsersService } from '@/lib/services/users';
import { withHandler } from '@/lib/api/handler';
import { requireUser } from '@/lib/api/auth-guard';
import { NotFoundError, BadRequestError } from '@/lib/core/errors';

export const GET = withHandler(async (req: NextRequest) => {
  const user = await requireUser(req);

  const profile = await UsersService.getUserByJwtId(user.id);
  if (!profile) throw new NotFoundError('User not found');
  return profile;
});

export const POST = withHandler(async (req: NextRequest) => {
  const body = await req.json();
  const user = await requireUser(req);

  const newUser = await UsersService.createUser({
    jwtId: user.id,
    email: user.email || '',
    name: body.name,
    avatar: body.avatar || null,
    location: body.location || null,
    timezone: body.timezone || 'UTC',
    authProvider: 'facebook', // TODO: Make this dynamic based on actual provider
    authProviderId: user.id,
  });

  if (!newUser) throw new BadRequestError('Failed to create user profile');
  return newUser;
});

export const PUT = withHandler(async (req: NextRequest) => {
  const body = await req.json();
  const user = await requireUser(req);

  const profile = await UsersService.getUserByJwtId(user.id);
  if (!profile) throw new NotFoundError('User not found');

  const updatedProfile = await UsersService.updateUser(profile.id, body);
  if (!updatedProfile) throw new BadRequestError('Update failed');
  return updatedProfile;
});
