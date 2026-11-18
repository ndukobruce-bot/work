import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE } from '@/lib/auth-session';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (user.role === 'GUEST') return NextResponse.json({ error: 'Guest workspaces do not have sign-in credentials.' }, { status: 403 });
  let body: { currentPassword?: string; newEmail?: string; newPassword?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const newEmail = body.newEmail?.trim().toLowerCase();
  const newPassword = body.newPassword;
  if (!body.currentPassword || (!newEmail && !newPassword)) return NextResponse.json({ error: 'Enter your current password and a new email or password.' }, { status: 400 });
  if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (newPassword && newPassword.length < 12) return NextResponse.json({ error: 'New password must be at least 12 characters.' }, { status: 400 });
  if (!(await verifyPassword(body.currentPassword, user.passwordHash))) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { ...(newEmail ? { email: newEmail } : {}), ...(newPassword ? { passwordHash: await hashPassword(newPassword), authVersion: { increment: 1 } } : {}) },
      select: { email: true, authVersion: true },
    });
    const response = NextResponse.json({ ok: true, email: updated.email });
    response.cookies.set(SESSION_COOKIE, await createSession(user.id, updated.authVersion), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
    return response;
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });
    throw error;
  }
}
