'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Clock3, Bookmark, BriefcaseBusiness } from 'lucide-react';
import { money, type Task } from '@/lib/data';

type Saved = { taskId: string };

export default function TasksPage() {
  const [q, setQ] = useState('');
  const [field, setField] = useState('All fields');
  const [level, setLevel] = useState('Any level');
  const [sort, setSort] = useState('Recommended');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fields = useMemo(() => [...new Set(tasks.map(task => task.field))], [tasks]);

  useEffect(() => {
    void Promise.all([
      fetch('/api/tasks').then(r => r.ok ? r.json() : { tasks: [] }).then(data => setTasks(data.tasks ?? [])),
      fetch('/api/saved').then(r => r.ok ? r.json() : []).then((rows: Saved[]) => setSaved(rows.map(row => row.taskId))),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function toggleSaved(taskId: string) {
    const isSaved = saved.includes(taskId);
    setSaved(current => isSaved ? current.filter(id => id !== taskId) : [...current, taskId]);
    void fetch('/api/saved', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, saved: !isSaved }) })
      .then(response => { if (!response.ok) throw new Error('Save failed'); })
      .catch(() => setSaved(current => isSaved ? [...current, taskId] : current.filter(id => id !== taskId)));
  }

  const filtered = useMemo(() => tasks
    .filter(task => (field === 'All fields' || task.field === field) && (level === 'Any level' || task.level === level) && `${task.title} ${task.field} ${task.description}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'Highest reward' ? b.rewardCents - a.rewardCents : sort === 'Quickest' ? a.hours - b.hours : 0), [tasks, q, field, level, sort]);

  return <div style={{ paddingTop: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 20, flexWrap: 'wrap' }}>
      <div><div className="pill" style={{ background: '#e9f3e7', color: '#347350' }}><BriefcaseBusiness size={13} /> The marketplace</div><h1 className="section-title" style={{ marginTop: 12, fontSize: 34 }}>Find your next project</h1><p className="muted" style={{ fontSize: 14, margin: '7px 0 0' }}>Thoughtful briefs, transparent rewards, work that matters.</p></div>
      <span className="pill">{filtered.length} open opportunities</span>
    </div>
    <div className="card" style={{ marginTop: 22, padding: 14, display: 'grid', gridTemplateColumns: 'minmax(200px,1fr) 220px 160px', gap: 10 }}>
      <div style={{ position: 'relative' }}><Search size={17} color="#829087" style={{ position: 'absolute', left: 13, top: 13 }} /><input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks, skills, fields…" style={{ paddingLeft: 40 }} /></div>
      <select className="input" value={field} onChange={e => setField(e.target.value)}><option>All fields</option>{fields.map(value => <option key={value}>{value}</option>)}</select>
      <select className="input" value={level} onChange={e => setLevel(e.target.value)}><option>Any level</option>{['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Elite'].map(value => <option key={value}>{value}</option>)}</select>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '18px 1px 12px', alignItems: 'center' }}><span className="muted" style={{ fontSize: 13 }}>Showing <b style={{ color: '#18231f' }}>{filtered.length}</b> opportunities</span><select className="input" style={{ width: 175, padding: '9px 12px', fontSize: 12 }} value={sort} onChange={e => setSort(e.target.value)}><option>Recommended</option><option>Highest reward</option><option>Quickest</option></select></div>
    {loading ? <div className="card" style={{ padding: 24 }}>Loading opportunities…</div> : filtered.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 13 }}>{filtered.map(task => <article key={task.id} className="card" style={{ padding: 20, position: 'relative' }}>
      <button aria-label={saved.includes(task.id) ? 'Remove saved task' : 'Save task'} onClick={() => toggleSaved(task.id)} style={{ position: 'absolute', right: 17, top: 16, border: 0, background: 'transparent', color: saved.includes(task.id) ? '#1f7a52' : '#87938b' }}><Bookmark size={18} fill={saved.includes(task.id) ? '#1f7a52' : 'none'} /></button>
      <span className="pill">{task.field}</span><Link href={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><h3 style={{ fontSize: 18, margin: '15px 38px 7px 0' }}>{task.title}</h3></Link>
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.6, minHeight: 40, margin: '0 0 15px' }}>{task.description}</p>
      <div style={{ display: 'flex', gap: 15, fontSize: 12, color: '#78857d', paddingBottom: 15, borderBottom: '1px solid #eef1ed' }}><span><Clock3 size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{task.hours} hours</span><span>{task.level}</span><span>{task.slots} slots</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}><div><div style={{ fontSize: 11, color: '#89958d' }}>Fixed reward</div><b style={{ color: '#1f7a52', fontSize: 20 }}>{money(task.rewardCents)}</b></div><Link href={`/tasks/${task.id}`} className="btn" style={{ padding: '9px 13px', fontSize: 12 }}>View brief</Link></div>
    </article>)}</div> : <div className="card" style={{ padding: 50, textAlign: 'center', marginTop: 20 }}><SlidersHorizontal color="#87938b" /><h3>No projects currently listed</h3><p className="muted">New opportunities will appear here when they are published.</p></div>}
  </div>;
}
