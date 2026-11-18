import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, mode: 'browser-local', persistence: 'this-browser-only' }, { headers: { 'Cache-Control': 'no-store' } });
}
