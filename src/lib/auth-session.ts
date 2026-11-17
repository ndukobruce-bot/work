import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createSessionToken, readSessionToken } from '@/lib/session-token';

export const SESSION_COOKIE = 'workvault_session';
export const createSession = createSessionToken;

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = await readSessionToken(token);
  if (!claims) return null;
  const user = await prisma.user.findUnique({ where: { id: claims.userId }, include: { profile: true } });
  return user?.accountStatus === 'ACTIVE' && user.authVersion === claims.version ? user : null;
}
