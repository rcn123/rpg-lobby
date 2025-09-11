import { NextRequest } from 'next/server';
import { sessionsService } from '@/lib/services/sessions';
import { withHandler } from '@/lib/api/handler';
import { requireUser } from '@/lib/api/auth-guard';
import { BadRequestError } from '@/lib/core/errors';

export const POST = withHandler(async (req: NextRequest) => {
  console.log('🚀 Sessions API: POST request received');
  console.log('📦 Request headers:', Object.fromEntries(req.headers.entries()));
  
  const body = await req.json();
  console.log('📝 Request body:', body);
  
  console.log('🔐 Attempting to authenticate user...');
  const user = await requireUser(req);
  console.log('✅ User authenticated:', { id: user.id, email: user.email });
  
  console.log('🗄️ Creating session in database...');
  const result = await sessionsService.createSession(body, user.id);
  console.log('📋 Session creation result:', { success: result.success, error: result.error });
  
  if (!result.success) throw new BadRequestError(result.error || 'Failed to create session');
  return result.data;
});

