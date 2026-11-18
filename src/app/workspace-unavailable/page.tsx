import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default async function WorkspaceUnavailable({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const needsSessionSecret = reason === 'session';

  return <div className="card" style={{ maxWidth: 680, margin: '48px auto', padding: '34px 30px' }}>
    <div style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 13, background: '#fff3e8', color: '#a85920' }}><AlertCircle size={22} /></div>
    <h1 style={{ fontSize: 27, margin: '18px 0 8px' }}>Guest workspace setup is incomplete</h1>
    <p className="muted" style={{ lineHeight: 1.7, margin: 0 }}>
      WorkVault has no sign-in screen. This deployment needs its server configuration completed before it can create a private workspace.
    </p>
    <div style={{ marginTop: 22, padding: 17, background: '#f7f9f6', borderRadius: 12, fontSize: 13, lineHeight: 1.8 }}>
      <b>Deployment checklist</b>
      <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
        <li>Add a persistent database URL compatible with the Prisma schema.</li>
        <li>Set <code>SESSION_SECRET</code> to a random value of at least 32 characters.</li>
        <li>Run <code>npm run db:deploy</code> against that database, then redeploy.</li>
      </ol>
      {needsSessionSecret && <p style={{ margin: '9px 0 0', color: '#a85920' }}>The session signing key is missing or too short.</p>}
      {reason === 'database' && <p style={{ margin: '9px 0 0', color: '#a85920' }}>The database could not create a workspace. Check its connection and that migrations have been applied.</p>}
    </div>
    <Link href="/" className="btn light" style={{ marginTop: 20 }}><RefreshCw size={15} /> Try again</Link>
  </div>;
}
