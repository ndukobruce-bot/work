import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth-session';

export async function POST() {
  if (!(await getCurrentUser())) return NextResponse.json({error:'Not signed in.'},{status:401});
  return NextResponse.json({error:'Payout processing is unavailable until a payout provider is configured.'},{status:503});
}
