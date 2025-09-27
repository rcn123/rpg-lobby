import { NextRequest } from 'next/server';
import { UsersService } from '@/lib/services/users';
import { withHandler } from '@/lib/api/handler';

export const GET = withHandler(async (req: NextRequest) => {
  const users = await UsersService.getAllUsers();
  return users;
});
