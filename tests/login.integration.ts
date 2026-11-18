import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  process.env.DATABASE_URL = 'file:./auth-integration.db';
  process.env.SESSION_SECRET = randomBytes(48).toString('base64url');
  const databaseFile = join(process.cwd(), 'prisma/auth-integration.db');
  copyFileSync(join(process.cwd(), 'prisma/dev.db'), databaseFile);

  const { PrismaClient } = await import('@prisma/client');
  const { GET: createGuest } = await import('../src/app/api/auth/guest/route');
  const { POST: login } = await import('../src/app/api/auth/login/route');
  const { POST: register } = await import('../src/app/api/auth/register/route');
  const { prisma: authDb } = await import('../src/lib/prisma');
  const { middleware } = await import('../src/middleware');
  const { readSessionToken } = await import('../src/lib/session-token');
  const { NextRequest } = await import('next/server');
  const db = new PrismaClient();

  try {
    const firstVisit = await middleware(new NextRequest('http://localhost:3000/tasks'));
    assert.equal(firstVisit.status, 307);
    assert.match(firstVisit.headers.get('location') || '', /\/api\/auth\/guest\?next=%2Ftasks/);

    const guestResponse = await createGuest(new NextRequest('http://localhost:3000/api/auth/guest?next=%2Ftasks'));
    assert.equal(guestResponse.status, 307);
    assert.equal(guestResponse.headers.get('location'), 'http://localhost:3000/tasks');
    const cookie = guestResponse.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie?.startsWith('workvault_session='));
    const token = cookie!.slice('workvault_session='.length);
    const claims = await readSessionToken(token);
    assert.ok(claims);

    const guest = await db.user.findUnique({ where: { id: claims!.userId }, include: { profile: true, wallet: true } });
    assert.equal(guest?.role, 'GUEST');
    assert.equal(guest?.accountStatus, 'ACTIVE');
    assert.ok(guest?.profile);
    assert.equal(guest?.wallet?.availableCents, 0);
    assert.equal(guest?.wallet?.pendingCents, 0);
    assert.equal(guest?.wallet?.withdrawnCents, 0);
    assert.equal(guest?.wallet?.lifetimeCents, 0);

    const allowed = await middleware(new NextRequest('http://localhost:3000/account', { headers: { cookie: cookie! } }));
    assert.equal(allowed.headers.get('x-middleware-next'), '1');

    const beforeRepeat = await db.user.count({ where: { role: 'GUEST' } });
    const repeatVisit = await createGuest(new NextRequest('http://localhost:3000/api/auth/guest?next=%2Faccount', { headers: { cookie: cookie! } }));
    assert.equal(repeatVisit.headers.get('location'), 'http://localhost:3000/account');
    assert.equal(repeatVisit.headers.get('set-cookie'), null);
    assert.equal(await db.user.count({ where: { role: 'GUEST' } }), beforeRepeat);

    const loginDisabled = await login(new NextRequest('http://localhost:3000/api/auth/login', { method: 'POST' }));
    const registerDisabled = await register(new NextRequest('http://localhost:3000/api/auth/register', { method: 'POST' }));
    assert.equal(loginDisabled.status, 410);
    assert.equal(registerDisabled.status, 410);
    console.log('Automatic guest workspace, zero-balance initialization, and protected-route integration passed.');
  } finally {
    await authDb.$disconnect();
    await db.$disconnect();
    rmSync(databaseFile, { force: true });
    rmSync(`${databaseFile}-journal`, { force: true });
  }
}

void main();
