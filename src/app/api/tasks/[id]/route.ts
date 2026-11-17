import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id }, include: { field: true } });
  if (!task || task.status !== 'AVAILABLE') return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  return NextResponse.json({ id: task.id, title: task.title, field: task.field.name, rewardCents: task.rewardCents, hours: task.estimatedHours, level: task.requiredLevel, difficulty: task.difficulty, deadline: task.deadline.toISOString().slice(0, 10), slots: task.slots, description: task.description, format: task.format }, { headers: { 'Cache-Control': 'private, no-store' } });
}
