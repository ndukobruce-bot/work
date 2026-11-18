import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Set DATABASE_URL before applying database migrations.');

// SQLite needs an empty file to exist before Prisma's migration engine can open it.
if (databaseUrl.startsWith('file:')) {
  const file = decodeURIComponent(databaseUrl.slice('file:'.length).split('?')[0]);
  const databasePath = isAbsolute(file) ? file : resolve(process.cwd(), 'prisma', file);
  mkdirSync(dirname(databasePath), { recursive: true });
  if (!existsSync(databasePath)) writeFileSync(databasePath, new Uint8Array());
}

const require = createRequire(import.meta.url);
execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});
