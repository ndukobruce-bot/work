import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session-token';

const openPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico' || openPaths.includes(pathname)) return NextResponse.next();
  if (await verifySessionToken(request.cookies.get('workvault_session')?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const target = new URL('/login', request.url);
  target.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(target);
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
