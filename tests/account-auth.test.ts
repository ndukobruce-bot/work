import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../src/lib/password';
import { createSessionToken, verifySessionToken } from '../src/lib/session-token';
import { walletIsReconciled, ledgerTotals } from '../src/lib/ledger';
import { getWithdrawalEligibility, WITHDRAWAL_HOLD_DAYS } from '../src/lib/withdrawal-eligibility';

const db = new PrismaClient();

test('passwords are stored as verifiable salted hashes', async () => {
  const password = `unit-${crypto.randomUUID()}-A9!`;
  const hash = await hashPassword(password);
  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('incorrect-password', hash), false);
});

test('signed sessions identify an account and reject tampering', async () => {
  const token = await createSessionToken('account-unit-test');
  assert.equal(await verifySessionToken(token), true);
  assert.equal(await verifySessionToken(`${token}x`), false);
  assert.equal(await verifySessionToken(null), false);
});

test('new accounts cannot withdraw before 60 days, and become eligible at the boundary', () => {
  const createdAt = new Date('2026-01-01T12:00:00.000Z');
  const before = getWithdrawalEligibility(createdAt, new Date('2026-03-02T11:59:59.999Z'));
  assert.equal(WITHDRAWAL_HOLD_DAYS, 60);
  assert.equal(before.eligible, false);
  assert.equal(before.daysRemaining, 1);
  const ready = getWithdrawalEligibility(createdAt, new Date('2026-03-02T12:00:00.000Z'));
  assert.equal(ready.eligible, true);
  assert.equal(ready.daysRemaining, 0);
  assert.equal(ready.availableAt.toISOString(), '2026-03-02T12:00:00.000Z');
});

test('password login rejects invalid credentials', async () => {
  const { POST } = await import('../src/app/api/auth/login/route');
  const { NextRequest } = await import('next/server');
  const request = new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'robinsonmccubbins@gmail.com', password: 'wrong-password' }),
  });
  const response = await POST(request);
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('the account resolves by its stored email and wallet totals reconcile', async () => {
  const user = await db.user.findUnique({
    where: { email: 'robinsonmccubbins@gmail.com' },
    include: { wallet: true, ledger: true, assignments: true, withdrawals: true },
  });
  assert.ok(user);
  assert.equal(user.accountStatus, 'ACTIVE');
  assert.ok(user.wallet);
  const view = { wallet: user.wallet, ledger: user.ledger, assignments: user.assignments, withdrawals: user.withdrawals };
  assert.equal(walletIsReconciled(view), true);
  const totals = ledgerTotals(view);
  assert.equal(totals.lifetimeCents, user.assignments.filter(x => x.status === 'PAID').reduce((sum, x) => sum + x.earnedCents, 0));
});

test.after(async () => { await db.$disconnect(); });
