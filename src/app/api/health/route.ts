import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const sessionReady = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
  let databaseReady = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseReady = true;
  } catch {
    databaseReady = false;
  }

  const ok = sessionReady && databaseReady;
  return NextResponse.json({
    ok,
    services: {
      guestSessions: sessionReady ? 'ready' : 'misconfigured',
      database: databaseReady ? 'ready' : 'unavailable',
    },
  }, { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
