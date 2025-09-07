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
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
  };
}
