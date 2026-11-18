# WorkVault

WorkVault is a task marketplace application using Prisma and SQLite for local development. Visitors automatically receive a separate guest workspace in their browser; there are no sign-in or sign-up screens.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
# Set DATABASE_URL and a random SESSION_SECRET of at least 32 characters in .env
npx prisma migrate deploy
npm run dev
```

Each guest workspace starts with a zero USD wallet. Submitted task rewards appear as pending until approved. Guest workspaces are stored in the database and tied to the browser cookie; clearing browser cookies loses access to that workspace.

## Commands

- `npm run dev` starts the local application.
- `npm run build` creates a production build.
- `npm run lint` performs TypeScript checking.
- `npm test` runs authentication, guest workspace, and wallet consistency checks.
- `npx prisma migrate deploy` applies migrations without resetting records.

## Guest and payout behavior

Withdrawals become eligible 60 days after a guest workspace is created. External payout processing remains unavailable until a payout provider is configured. A production deployment needs a persistent database and a `SESSION_SECRET` of at least 32 characters.
