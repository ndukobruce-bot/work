import { NextResponse } from 'next/server';
import { LOCAL_TASKS } from '@/lib/local-tasks';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = LOCAL_TASKS.find(item => item.id === id);
  return task ? NextResponse.json(task, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'Project not found.' }, { status: 404 });
}
