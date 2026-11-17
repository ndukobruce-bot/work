import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE } from '@/lib/auth-session';

const attempts = new Map<string, { count: number; startedAt: number }>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const attempt = attempts.get(ip);
  if (attempt && now - attempt.startedAt < 60 * 60 * 1000 && attempt.count >= 8) {
    return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
  }
  attempts.set(ip, attempt && now - attempt.startedAt < 60 * 60 * 1000 ? { ...attempt, count: attempt.count + 1 } : { count: 1, startedAt: now });

  let body: { name?: string; email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!name || name.length > 100 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter your name and a valid email address.' }, { status: 400 });
  }
  if (!password || password.length < 12) return NextResponse.json({ error: 'Password must be at least 12 characters.' }, { status: 400 });
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 });

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: 'WORKER',
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
      select: { id: true, name: true, email: true, authVersion: true },
    });
    const response = NextResponse.json({ ok: true, user: { name: user.name, email: user.email } }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, await createSession(user.id, user.authVersion), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
    return response;
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    throw error;
  }
}
