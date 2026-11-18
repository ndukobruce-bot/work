import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') || '/';
  const destination = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/';
  return NextResponse.redirect(new URL(destination, request.url));
}
