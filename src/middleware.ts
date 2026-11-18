import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session-token';

const openPaths = ['/api/auth/guest', '/api/auth/login', '/api/auth/register', '/api/health', '/api/tasks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') return NextResponse.next();
  if (pathname === '/login' || pathname === '/signup') return NextResponse.redirect(new URL('/', request.url));
  if (pathname === '/workspace-unavailable') return NextResponse.next();
  if (openPaths.includes(pathname)) return NextResponse.next();
  if (await verifySessionToken(request.cookies.get('workvault_session')?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const target = new URL('/api/auth/guest', request.url);
  target.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(target);
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
