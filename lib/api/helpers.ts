import { NextResponse } from 'next/server';

export function apiResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(message: string | null, status = 500) {
  return NextResponse.json({ error: message || 'Unknown error' }, { status });
}
