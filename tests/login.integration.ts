import assert from 'node:assert/strict';

async function main() {
  const storage = new Map<string, string>();
  Object.assign(globalThis, {
    window: {},
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
  });
  const { LOCAL_TASKS } = await import('../src/lib/local-tasks');
  const { readGuestData, startLocalTask, submitLocalTask, toggleSavedTask, localAccount } = await import('../src/lib/guest-workspace');
  const { GET: health } = await import('../src/app/api/health/route');
  const { GET: tasks } = await import('../src/app/api/tasks/route');
  const { GET: taskDetail } = await import('../src/app/api/tasks/[id]/route');
  const { NextRequest } = await import('next/server');

  const status = await health();
  assert.equal(status.status, 200);
  assert.deepEqual(await status.json(), { ok: true, mode: 'browser-local', persistence: 'this-browser-only' });
  const listings = await tasks();
  assert.equal(listings.status, 200);
  assert.equal((await listings.json()).tasks.length, LOCAL_TASKS.length);
  const detail = await taskDetail(new NextRequest('http://localhost/api/tasks/brief-research'), { params: Promise.resolve({ id: 'brief-research' }) });
  assert.equal(detail.status, 200);

  const task = LOCAL_TASKS[0];
  startLocalTask(task.id);
  toggleSavedTask(task.id, true);
  submitLocalTask(task, 'A detailed research summary with findings and clear recommendations.', true);
  const account = localAccount();
  assert.equal(account.assignments[0].status, 'UNDER_REVIEW');
  assert.equal(account.wallet.pendingCents, Math.round(task.rewardCents * 0.9));
  assert.equal(account.wallet.availableCents, 0);
  assert.equal(readGuestData().savedTaskIds[0], task.id);
  assert.equal(readGuestData().assignments[0].text, 'A detailed research summary with findings and clear recommendations.');
  console.log('Browser-local access, marketplace, task submission, and wallet accounting passed without deployment secrets or database access.');
}

void main();
