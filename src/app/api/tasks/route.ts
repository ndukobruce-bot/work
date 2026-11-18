import { NextResponse } from 'next/server';
import { LOCAL_TASKS } from '@/lib/local-tasks';

export async function GET() {
  return NextResponse.json({ tasks: LOCAL_TASKS, fields: [...new Set(LOCAL_TASKS.map(task => task.field))] }, { headers: { 'Cache-Control': 'no-store' } });
}
