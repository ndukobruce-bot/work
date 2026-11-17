export const WITHDRAWAL_HOLD_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

export function withdrawalAvailableAt(createdAt: Date) {
  return new Date(createdAt.getTime() + WITHDRAWAL_HOLD_DAYS * DAY_MS);
}

export function getWithdrawalEligibility(createdAt: Date, now = new Date()) {
  const availableAt = withdrawalAvailableAt(createdAt);
  const remainingMs = availableAt.getTime() - now.getTime();
  return {
    eligible: remainingMs <= 0,
    availableAt,
    daysRemaining: remainingMs <= 0 ? 0 : Math.ceil(remainingMs / DAY_MS),
  };
}
