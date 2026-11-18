'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, Wallet, LayoutDashboard, Bookmark, Search, Bell } from 'lucide-react';
import { useGuestName } from '@/lib/use-guest-name';

const nav = [
  ['Overview', '/account', LayoutDashboard],
  ['Find work', '/tasks', Search],
  ['Saved tasks', '/saved', Bookmark],
  ['My work', '/account?tab=work', BriefcaseBusiness],
  ['Wallet', '/wallet', Wallet],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const displayName = useGuestName();
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();

  return <>
    <header style={{ height: 72, background: 'rgba(255,255,255,.92)', borderBottom: '1px solid #e9ede9', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(12px)' }}>
      <div className="wrap" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#18231f' }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: '#1f7a52', display: 'grid', placeItems: 'center', color: 'white' }}><BriefcaseBusiness size={19} /></span>
          <b style={{ fontFamily: 'Manrope', fontSize: 20, letterSpacing: '-.06em' }}>workvault<span style={{ color: '#6e9759' }}>.</span></b>
        </Link>
        <nav className="desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <Link href="/tasks" className="navlink">Explore work</Link>
          <Link href="/account" className="navlink">My account</Link>
          <Link href="/legal/content-policy" className="navlink">Trust & safety</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/account" className="navlink desktop" aria-label="Notifications"><Bell size={17} /></Link>
          <Link href="/account?tab=profile" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: '#18231f' }}>
            <div style={{ width: 36, height: 36, borderRadius: 50, background: '#dcebdc', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#246b49' }}>{initials}</div>
            <div className="desktop"><b style={{ fontSize: 13 }}>{displayName}</b><div style={{ fontSize: 11, color: '#819087' }}>Private to this browser</div></div>
          </Link>
        </div>
      </div>
    </header>
    <div className="wrap shell-grid" style={{ display: 'grid', gridTemplateColumns: '210px minmax(0,1fr)', gap: 32, alignItems: 'start', paddingTop: 28 }}>
      <aside className="desktop" style={{ position: 'sticky', top: 96 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.11em', fontWeight: 800, color: '#9aa49d', padding: '4px 12px 12px' }}>Workspace</div>
        {nav.map(([label, href, Icon]) => <Link key={label} href={href} className={`navlink ${path === href ? 'active' : ''}`}><Icon size={17} />{label}</Link>)}
        <div style={{ height: 1, background: '#e6ebe5', margin: '18px 10px' }} />
        <div style={{ marginTop: 20, padding: 12, fontSize: 11, color: '#9aa49d' }}>USD guest wallet</div>
      </aside>
      <main style={{ minWidth: 0, paddingBottom: 70 }}>{children}</main>
    </div>
    <footer style={{ borderTop: '1px solid #e9ede9', background: 'white', marginTop: 50 }}>
      <div className="wrap shell-grid" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 22, paddingBottom: 22, fontSize: 12, color: '#7c8980' }}>
        <span>© 2026 WorkVault · Thoughtful work, fairly rewarded.</span>
        <span><Link href="/legal/terms" style={{ color: 'inherit', marginRight: 14 }}>Terms</Link><Link href="/legal/privacy" style={{ color: 'inherit' }}>Privacy</Link></span>
      </div>
    </footer>
  </>;
}
