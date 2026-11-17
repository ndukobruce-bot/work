import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  process.env.DATABASE_URL = 'file:./auth-integration.db';
  process.env.SESSION_SECRET = randomBytes(48).toString('base64url');
  const databaseFile = join(process.cwd(), 'prisma/auth-integration.db');
  copyFileSync(join(process.cwd(), 'prisma/dev.db'), databaseFile);

  const { PrismaClient } = await import('@prisma/client');
  const { hashPassword } = await import('../src/lib/password');
  const { POST } = await import('../src/app/api/auth/login/route');
  const { POST: register } = await import('../src/app/api/auth/register/route');
  const { prisma: authDb } = await import('../src/lib/prisma');
  const { middleware } = await import('../src/middleware');
  const { NextRequest } = await import('next/server');
  const db = new PrismaClient();
  const email = `auth-check-${randomUUID()}@example.invalid`;
  const password = randomBytes(30).toString('base64url');
  const newEmail = `signup-check-${randomUUID()}@example.invalid`;
  const newPassword = randomBytes(30).toString('base64url');

  try {
    await db.user.create({ data: { email, passwordHash: await hashPassword(password), name: 'Authentication check' } });
    const login = await POST(new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }),
    }));
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie');
    assert.ok(cookie?.includes('workvault_session='));

    const route = await middleware(new NextRequest('http://localhost:3000/account', { headers: { cookie: cookie!.split(';')[0] } }));
    assert.equal(route.headers.get('x-middleware-next'), '1');

    const denied = await middleware(new NextRequest('http://localhost:3000/account'));
    assert.equal(denied.status, 307);
    assert.equal(denied.headers.get('location')?.includes('/login?next=%2Faccount'), true);
    const deniedApi = await middleware(new NextRequest('http://localhost:3000/api/account'));
    assert.equal(deniedApi.status, 401);

    const wrong = await POST(new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'wrong-password' }),
    }));
    assert.equal(wrong.status, 401);
    assert.equal(wrong.headers.get('set-cookie'), null);

    const registrationBody = { name: 'New Worker', email: newEmail, password: newPassword };
    const registered = await register(new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(registrationBody),
    }));
    assert.equal(registered.status, 201);
    assert.ok(registered.headers.get('set-cookie')?.includes('workvault_session='));
    const newUser = await db.user.findUnique({ where: { email: newEmail }, include: { profile: true, wallet: true } });
    assert.ok(newUser?.profile);
    assert.equal(newUser?.accountStatus, 'ACTIVE');
    assert.equal(newUser?.verified, false);
    assert.equal(await (await import('../src/lib/password')).verifyPassword(newPassword, newUser!.passwordHash), true);
    assert.equal(newUser?.wallet?.availableCents, 0);

    const duplicate = await register(new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(registrationBody),
    }));
    assert.equal(duplicate.status, 409);
    console.log('Password login, registration, and protected-route integration passed.');
  } finally {
    await db.user.deleteMany({ where: { email } });
    await db.user.deleteMany({ where: { email: newEmail } });
    await authDb.$disconnect();
    await db.$disconnect();
    rmSync(databaseFile, { force: true });
    rmSync(`${databaseFile}-journal`, { force: true });
  }
}

void main();
