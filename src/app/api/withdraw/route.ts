import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth-session';
import {getWithdrawalEligibility} from '@/lib/withdrawal-eligibility';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error:'Not signed in.'},{status:401});
  const eligibility = getWithdrawalEligibility(user.createdAt);
  if (!eligibility.eligible) return NextResponse.json({error:`Withdrawals are available 60 days after account creation. Try again in ${eligibility.daysRemaining} day${eligibility.daysRemaining === 1 ? '' : 's'}.`,availableAt:eligibility.availableAt.toISOString(),daysRemaining:eligibility.daysRemaining},{status:403});
  return NextResponse.json({error:'Payout processing is unavailable until a payout provider is configured.'},{status:503});
}
