import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UnauthorizedError } from "@/lib/core/errors";

export async function requireUser(req: NextRequest) {
  console.log('🔐 Auth Guard: Checking authentication');
  console.log('📦 Request headers available:', req.headers ? 'Yes' : 'No');
  
  const authHeader = req.headers.get('authorization');
  console.log('🔑 Authorization header:', authHeader ? 'Present' : 'Missing');
  console.log('🔑 Authorization header value:', authHeader);
  
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
