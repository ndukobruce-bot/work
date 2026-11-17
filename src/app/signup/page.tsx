'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, LockKeyhole, UserRound } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create your account.');
      router.replace('/account');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your account.');
    } finally {
      setBusy(false);
    }
  }

  return <div style={{ maxWidth: 490, margin: '24px auto 50px' }}>
    <div className="card" style={{ padding: '32px 34px' }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: '#1f7a52', display: 'grid', placeItems: 'center', color: 'white' }}><BriefcaseBusiness size={22} /></div>
      <div className="pill" style={{ marginTop: 20, background: '#edf5e9', color: '#347350' }}>Create your WorkVault account</div>
      <h1 style={{ fontSize: 32, margin: '13px 0 6px' }}>Join WorkVault</h1>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>Your account will have its own profile and wallet.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 13 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>Full name<div style={{ position: 'relative', marginTop: 7 }}><UserRound size={16} color="#8b968e" style={{ position: 'absolute', left: 13, top: 13 }} /><input className="input" autoComplete="name" value={name} onChange={event => setName(event.target.value)} maxLength={100} required style={{ paddingLeft: 39 }} /></div></label>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>Email address<input className="input" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required style={{ marginTop: 7 }} /></label>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>Password<div style={{ position: 'relative', marginTop: 7 }}><LockKeyhole size={16} color="#8b968e" style={{ position: 'absolute', left: 13, top: 13 }} /><input className="input" type="password" autoComplete="new-password" minLength={12} value={password} onChange={event => setPassword(event.target.value)} required style={{ paddingLeft: 39 }} /></div><span className="muted" style={{ display: 'block', fontSize: 10, marginTop: 5 }}>Use at least 12 characters.</span></label>
        {error && <div role="alert" style={{ fontSize: 12, color: '#b33f38', background: '#fff2f0', padding: 10, borderRadius: 8 }}>{error}</div>}
        <button className="btn" disabled={busy} style={{ width: '100%', marginTop: 3 }}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={15} /></button>
      </form>
      <p className="muted" style={{ fontSize: 11, lineHeight: 1.6, margin: '17px 0 0' }}>You can sign in immediately. Email verification and password-reset emails are not configured.</p>
    </div>
    <p style={{ textAlign: 'center', fontSize: 12, color: '#819087', marginTop: 17 }}>Already have an account? <Link href="/login" style={{ color: '#1f7a52', fontWeight: 700 }}>Sign in</Link></p>
  </div>;
}
