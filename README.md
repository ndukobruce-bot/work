# WorkVault

WorkVault is a task marketplace application using a SQLite database and Prisma. The account `robinsonmccubbins@gmail.com` is looked up like any other account; sign-in requires its stored password hash.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
# Set DATABASE_URL and a random SESSION_SECRET of at least 32 characters in .env
npx prisma migrate deploy
npm run dev
```

Configure or rotate the account password through your credential manager. Supply it as `ACCOUNT_PASSWORD` to the command process, then run `npm run account:password`. The command stores only a salted password hash and never logs the credential. Do not put a real password in source control or a command-line argument.

## Commands

- `npm run dev` starts the local application.
- `npm run build` creates a production build.
- `npm run lint` performs TypeScript checking.
- `npm test` runs authentication and wallet consistency checks.
- `npx prisma migrate deploy` applies database migrations without resetting existing records.
- `npm run account:password` updates the account password hash using `ACCOUNT_PASSWORD` from the process environment.

## Current capabilities and integration requirements

Authentication uses password verification and signed, expiring sessions. Registration is available for individual worker accounts. Email verification, password-reset email, and external email delivery are not configured. The marketplace has no client task-publishing workflow in this project. Payout requests are disabled until a payout provider integration is configured. File uploads currently use generated PDFs; production file storage and malware scanning are not configured.

The account and unrelated database records are preserved by migrations. Do not run ad-hoc deletion or database reset commands against account data.
