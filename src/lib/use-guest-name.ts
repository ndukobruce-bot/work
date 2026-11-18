'use client';
import { useEffect, useState } from 'react';
export function useGuestName() { const [name, setName] = useState('Guest workspace'); useEffect(() => { const id = localStorage.getItem('workvault.browser-id') ?? crypto.randomUUID(); localStorage.setItem('workvault.browser-id', id); setName(`Workspace ${id.slice(0, 4).toUpperCase()}`); }, []); return name; }
