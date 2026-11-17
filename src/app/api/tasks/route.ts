import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.task.findMany({ where: { status: 'AVAILABLE', slots: { gt: 0 } }, include: { field: true }, orderBy: { createdAt: 'desc' } });
  const tasks = rows.map(task => ({ id: task.id, title: task.title, field: task.field.name, rewardCents: task.rewardCents, hours: task.estimatedHours, level: task.requiredLevel, difficulty: task.difficulty, deadline: task.deadline.toISOString().slice(0, 10), slots: task.slots, description: task.description, format: task.format }));
  return NextResponse.json({ tasks, fields: [...new Set(tasks.map(task => task.field))] }, { headers: { 'Cache-Control': 'private, no-store' } });
}
