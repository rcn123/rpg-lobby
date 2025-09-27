import { NextRequest } from 'next/server';
import { sessionsService } from '@/lib/services/sessions';
import { UsersService } from '@/lib/services/users';
import { withHandler } from '@/lib/api/handler';
import { requireUser } from '@/lib/api/auth-guard';
import { BadRequestError } from '@/lib/core/errors';

export const POST = withHandler(async (req: NextRequest) => {
  console.log('🚀 Sessions API: POST request received');
  console.log('📦 Request headers:', Object.fromEntries(req.headers.entries()));
  
  const body = await req.json();
  console.log('📝 Request body:', body);
  
  console.log('🔐 Attempting to authenticate user...');
  const authUser = await requireUser(req);
  console.log('✅ User authenticated:', { 
    id: authUser.id, 
    email: authUser.email,
    hasName: 'name' in authUser,
    name: 'name' in authUser ? authUser.name : 'N/A',
    type: typeof authUser
  });
  
  console.log('👤 Looking up user in database...');
  console.log('🔍 AuthUser properties:', Object.keys(authUser));
  console.log('🔍 AuthUser values:', authUser);
  
  // If this is a switched user, we already have the full user object
  let user;
  if ('name' in authUser && authUser.name) {
    console.log('✅ Using switched user:', { id: authUser.id, name: authUser.name });
    user = authUser;
  } else {
    console.log('🔄 Not a switched user, looking up by JWT ID...');
    // Otherwise, look up by JWT ID (normal auth flow)
    user = await UsersService.getUserByJwtId(authUser.id);
    if (!user) {
      console.log('❌ User not found in database for JWT ID:', authUser.id);
      throw new BadRequestError('User profile not found. Please complete your profile first.');
    }
    console.log('✅ User found in database:', { id: user.id, name: user.name });
  }
  
  console.log('🎯 Final user for session creation:', { id: user.id, name: user.name, email: user.email });
  
  console.log('🗄️ Creating session in database...');
  const result = await sessionsService.createSession(body, user.id);
  console.log('📋 Session creation result:', { success: result.success, error: result.error });
  
  if (!result.success) throw new BadRequestError(result.error || 'Failed to create session');
  return result.data;
});

