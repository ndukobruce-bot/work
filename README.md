# WorkVault

WorkVault opens directly into a private browser workspace. There are no sign-in or sign-up screens. The marketplace examples, saved work, task drafts, submissions, and wallet state are stored in that browser's local storage; they are not sent to the application database or shared between browsers/devices.

## Run locally

```powershell
npm install
npm run dev
```

No database, account, email provider, or session secret is required for the browser-local workspace. `npm run build`, `npm run lint`, and `npm test` validate the app. Legacy Prisma migrations and API routes remain for the unrelated account backend, but the guest experience does not call them.

Task rewards remain pending for review. A browser-local submission is not proof of work approval or a payment. Withdrawal requests are only recorded locally; no funds are transferred.

Clearing this site's browser storage removes its workspace. Opening the site in another browser creates a separate empty workspace.
