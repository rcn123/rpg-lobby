import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UnauthorizedError } from "@/lib/core/errors";

export async function requireUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError();
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedError();
    }
    return user;
  } catch (error) {
    throw new UnauthorizedError();
  }
}
