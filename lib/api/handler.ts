import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/core/errors";

export function withHandler<T>(
  fn: (req: NextRequest, ctx: any) => Promise<T>
) {
  return async (req: NextRequest, ctx: any) => {
    try {
      const data = await fn(req, ctx);
      return NextResponse.json({ data });
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('🚨 API Error:', err.message, 'Status:', err.status);
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error('💥 Unexpected error in API handler:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  };
}
