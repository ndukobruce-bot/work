import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

loadEnvConfig(process.cwd());

async function main() {
  const password = process.env.ACCOUNT_PASSWORD;
  if (!password || password.length < 12) throw new Error('Set ACCOUNT_PASSWORD through your credential manager (minimum 12 characters).');
  const db = new PrismaClient();
  try {
    const account = await db.user.findUnique({ where: { email: 'robinsonmccubbins@gmail.com' } });
    if (!account) throw new Error('The account must exist before its password can be configured.');
    await db.user.update({ where: { id: account.id }, data: { passwordHash: await hashPassword(password) } });
    console.log('Account password updated.');
  } finally {
    await db.$disconnect();
  }
}

void main();
