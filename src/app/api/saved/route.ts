import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const rows = await prisma.savedTask.findMany({ where: { userId: user.id }, include: { task: { include: { field: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(rows.map(row => ({ id: row.id, taskId: row.taskId, title: row.task.title, field: row.task.field.name, rewardCents: row.task.rewardCents, estimatedHours: row.task.estimatedHours, createdAt: row.createdAt })));
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  let body: { taskId?: string; saved?: boolean };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!body.taskId || typeof body.saved !== 'boolean') return NextResponse.json({ error: 'Invalid saved-task update.' }, { status: 400 });
  const task = await prisma.task.findUnique({ where: { id: body.taskId } });
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  if (body.saved) {
    const row = await prisma.savedTask.upsert({ where: { userId_taskId: { userId: user.id, taskId: task.id } }, update: {}, create: { userId: user.id, taskId: task.id } });
    return NextResponse.json({ ok: true, saved: true, id: row.id });
  }
  await prisma.savedTask.deleteMany({ where: { userId: user.id, taskId: task.id } });
  return NextResponse.json({ ok: true, saved: false });
}
