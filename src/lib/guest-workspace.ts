'use client';

import { LOCAL_TASKS } from '@/lib/local-tasks';
import type { Task } from '@/lib/data';

export { LOCAL_TASKS };

export type LocalAssignment = { taskId: string; status: 'IN_PROGRESS' | 'UNDER_REVIEW' | 'PAID'; startedAt: string; submittedAt?: string; text?: string; earnedCents: number; aiDisclosure?: boolean };
export type LocalWithdrawal = { id: string; amountCents: number; method: string; status: string; createdAt: string };
type GuestData = { createdAt: string; savedTaskIds: string[]; assignments: LocalAssignment[]; withdrawals: LocalWithdrawal[] };
const KEY = 'workvault.guest.v1';

function empty(): GuestData { return { createdAt: new Date().toISOString(), savedTaskIds: [], assignments: [], withdrawals: [] }; }
export function readGuestData(): GuestData {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const initial = empty(); localStorage.setItem(KEY, JSON.stringify(initial)); return initial; }
    const data = JSON.parse(raw) as GuestData;
    return { ...empty(), ...data, savedTaskIds: data.savedTaskIds ?? [], assignments: data.assignments ?? [], withdrawals: data.withdrawals ?? [] };
  } catch { return empty(); }
}
export function writeGuestData(data: GuestData) { if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(data)); }
export function toggleSavedTask(taskId: string, saved: boolean) { const data = readGuestData(); data.savedTaskIds = saved ? [...new Set([...data.savedTaskIds, taskId])] : data.savedTaskIds.filter(id => id !== taskId); writeGuestData(data); }
export function startLocalTask(taskId: string) { const data = readGuestData(); if (!data.assignments.some(row => row.taskId === taskId)) data.assignments.push({ taskId, status: 'IN_PROGRESS', startedAt: new Date().toISOString(), earnedCents: 0 }); writeGuestData(data); }
export function submitLocalTask(task: Task, text: string, aiDisclosure: boolean) { const data = readGuestData(); const existing = data.assignments.find(row => row.taskId === task.id); const row: LocalAssignment = { taskId: task.id, status: 'UNDER_REVIEW', startedAt: existing?.startedAt ?? new Date().toISOString(), submittedAt: new Date().toISOString(), text, aiDisclosure, earnedCents: Math.round(task.rewardCents * 0.9) }; data.assignments = [...data.assignments.filter(item => item.taskId !== task.id), row]; writeGuestData(data); return row; }
export function localAccount() {
  const data = readGuestData();
  const pendingCents = data.assignments.filter(row => row.status === 'UNDER_REVIEW').reduce((sum, row) => sum + row.earnedCents, 0);
  const withdrawnCents = data.withdrawals.filter(row => row.status === 'REQUESTED').reduce((sum, row) => sum + row.amountCents, 0);
  const paidAssignments = data.assignments.filter(row => row.status === 'PAID');
  const lifetimeCents = paidAssignments.reduce((sum, row) => sum + row.earnedCents, 0);
  const availableCents = lifetimeCents - withdrawnCents;
  return {
    id: 'local-guest', name: 'Guest workspace', email: 'Private browser workspace', createdAt: data.createdAt,
    country: 'Your device', avatarUrl: '/avatar-default.svg', bio: 'A private workspace stored in this browser.', languages: ['English'], level: lifetimeCents ? 'Intermediate' : 'Beginner', rating: 0, approvalRate: 0, verified: false,
    wallet: { availableCents, pendingCents, withdrawnCents, lifetimeCents, currency: 'USD' },
    ledger: [...paidAssignments.map(row => ({ id: `earning-${row.taskId}`, amountCents: row.earnedCents, type: 'EARNING', description: 'Approved task reward', createdAt: row.submittedAt ?? row.startedAt })), ...data.withdrawals.map(row => ({ id: row.id, amountCents: -row.amountCents, type: 'WITHDRAWAL', description: `${row.method} withdrawal request`, createdAt: row.createdAt }))],
    withdrawals: data.withdrawals,
    assignments: data.assignments.map(row => { const task = LOCAL_TASKS.find(item => item.id === row.taskId)!; return { status: row.status, submittedAt: row.submittedAt ?? null, completedAt: row.status === 'PAID' ? row.submittedAt ?? null : null, startedAt: row.startedAt, earnedCents: row.earnedCents, score: null, feedback: null, task: { id: task.id, slug: task.id, title: task.title, rewardCents: task.rewardCents, field: { name: task.field } } }; }),
    skills: [], badges: [], ratings: [], notifications: [], savedTaskIds: data.savedTaskIds,
  };
}

export function downloadLocalPdf(title: string, text: string, filename: string) {
  const escapePdf = (line: string) => line.replace(/[^\x20-\x7e]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = [title, '', ...text.split(/\r?\n/)].flatMap(line => { const parts: string[] = []; for (let i = 0; i < line.length; i += 86) parts.push(line.slice(i, i + 86)); return parts.length ? parts : ['']; }).slice(0, 52);
  const commands = ['BT', '/F1 11 Tf', '50 750 Td', '14 TL', ...lines.flatMap((line, i) => i ? ['T*', `(${escapePdf(line)}) Tj`] : [`(${escapePdf(line)}) Tj`]), 'ET'].join('\n');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`];
  let output = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = output.length; output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([output], { type: 'application/pdf' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}
