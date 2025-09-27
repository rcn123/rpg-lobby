import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UsersService } from "@/lib/services/users";
import { UnauthorizedError } from "@/lib/core/errors";

export async function requireUser(req: NextRequest) {
  console.log('🔐 Auth Guard: Checking authentication');
  
  // Check for switched user header first
  const switchedUserId = req.headers.get('X-Switched-User-ID');
  if (switchedUserId) {
    console.log('🔄 Switched user detected:', switchedUserId);
    
    // Validate the switched user exists in database
    const user = await UsersService.getUserById(switchedUserId);
    if (!user) {
      console.log('❌ Switched user not found in database');
      throw new UnauthorizedError();
    }
    
    console.log('✅ Switched user validated:', { id: user.id, name: user.name });
    return user;
  }
  
  // Fall back to JWT validation
  const authHeader = req.headers.get('authorization');
  console.log('🔑 Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid authorization header found');
    throw new UnauthorizedError();
  }

  const token = authHeader.substring(7);
  console.log('🎫 Token extracted, length:', token.length);
  
  try {
    console.log('🔍 Validating token with Supabase...');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      console.log('❌ Supabase auth error:', error.message);
      throw new UnauthorizedError();
    }
    
    if (!user) {
      console.log('❌ No user returned from Supabase');
      throw new UnauthorizedError();
    }
    
    console.log('✅ User authenticated successfully:', { id: user.id, email: user.email });
    return user;
  } catch (error) {
    console.log('💥 Auth validation error:', error);
    throw new UnauthorizedError();
  }
}
