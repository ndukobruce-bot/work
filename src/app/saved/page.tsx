'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Clock3, Trash2, Search } from 'lucide-react';
import { money } from '@/lib/data';
import { LOCAL_TASKS } from '@/lib/local-tasks';
import { readGuestData, toggleSavedTask } from '@/lib/guest-workspace';

export default function SavedTasks() {
  const [items, setItems] = useState<typeof LOCAL_TASKS>([]);
  const refresh = () => setItems(LOCAL_TASKS.filter(task => readGuestData().savedTaskIds.includes(task.id)));
  useEffect(() => { refresh(); window.addEventListener('storage', refresh); window.addEventListener('workvault-local-update', refresh); return () => { window.removeEventListener('storage', refresh); window.removeEventListener('workvault-local-update', refresh); }; }, []);
  function remove(taskId: string) { toggleSavedTask(taskId, false); window.dispatchEvent(new Event('workvault-local-update')); refresh(); }
  return <div style={{paddingTop:8}}><div className="pill" style={{background:'#e9f3e7',color:'#347350'}}><Bookmark size={13}/> Your shortlist</div><h1 className="section-title" style={{marginTop:12,fontSize:32}}>Saved opportunities</h1><p className="muted" style={{fontSize:13}}>Saved privately in this browser.</p>{items.length?<div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:13,marginTop:18}}>{items.map(x=><div className="card" key={x.id} style={{padding:20,position:'relative'}}><button aria-label={`Remove ${x.title} from saved`} onClick={()=>remove(x.id)} style={{position:'absolute',right:16,top:15,border:0,background:'transparent',color:'#78857d'}}><Trash2 size={17}/></button><span className="pill">{x.field}</span><h2 style={{fontSize:18,margin:'14px 35px 8px 0'}}>{x.title}</h2><div className="muted" style={{fontSize:12,marginBottom:15}}><Clock3 size={14} style={{verticalAlign:'middle',marginRight:5}}/>{x.hours} hours · {money(x.rewardCents)}</div><Link className="btn" href={`/tasks/${x.id}`}>View task brief</Link></div>)}</div>:<div className="card" style={{padding:42,textAlign:'center',marginTop:18}}><Bookmark size={22} color="#5a936f"/><h2 style={{fontSize:19}}>Your shortlist is empty</h2><p className="muted" style={{fontSize:13}}>Save promising tasks from the marketplace to see them here.</p><Link href="/tasks" className="btn"><Search size={15}/>Explore work</Link></div>}</div>;
}
