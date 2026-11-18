import { randomBytes, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE } from '@/lib/auth-session';

export const runtime = 'nodejs';
const creationsByIp = new Map<string, { startedAt: number; count: number }>();

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') || '/';
  const destination = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/';
  const currentCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return NextResponse.json({ error: 'Guest workspaces are not configured on this deployment.' }, { status: 503 });
  }

  try {
    if (currentCookie) {
      const { readSessionToken } = await import('@/lib/session-token');
      const claims = await readSessionToken(currentCookie);
      if (claims) {
        const existing = await prisma.user.findFirst({ where: { id: claims.userId, role: 'GUEST', accountStatus: 'ACTIVE', authVersion: claims.version }, select: { id: true } });
        if (existing) return NextResponse.redirect(new URL(destination, request.url));
      }
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const now = Date.now();
    const previous = creationsByIp.get(ip);
    if (previous && now - previous.startedAt < 60 * 60 * 1000 && previous.count >= 20) {
      return NextResponse.json({ error: 'Too many guest workspaces were requested. Try again later.' }, { status: 429 });
    }
    creationsByIp.set(ip, previous && now - previous.startedAt < 60 * 60 * 1000 ? { ...previous, count: previous.count + 1 } : { startedAt: now, count: 1 });

    const email = `guest-${randomUUID()}@workspace.invalid`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(randomBytes(48).toString('base64url')),
        name: 'Guest workspace',
        role: 'GUEST',
        accountStatus: 'ACTIVE',
        avatarUrl: '/avatar-default.svg',
        country: '',
        level: 'Beginner',
        rating: 0,
        approvalRate: 0,
        verified: false,
        profile: { create: { bio: '', languages: '[]' } },
        wallet: { create: { availableCents: 0, pendingCents: 0, withdrawnCents: 0, lifetimeCents: 0, currency: 'USD' } },
      },
      select: { id: true, authVersion: true },
    });

    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(SESSION_COOKIE, await createSession(user.id, user.authVersion), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not start a guest workspace. Please try again.' }, { status: 503 });
  }
}
