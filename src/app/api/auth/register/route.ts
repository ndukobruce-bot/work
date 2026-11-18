import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Sign-up is not used. Your browser opens a guest workspace automatically.' }, { status: 410 });
}
