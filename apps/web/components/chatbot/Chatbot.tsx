'use client';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@agora/ui';
import { ChatDrawer } from './ChatDrawer';
export function Chatbot() { const [open,setOpen]=useState(false); const pathname=usePathname(); if (pathname.startsWith('/escrow/')) return null; return <><button type="button" aria-label="Open Agora chatbot" onClick={()=>setOpen(true)} className={cn('fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[var(--color-arc-purple)] text-white shadow-[0_0_32px_rgba(92,91,214,0.35)] transition hover:bg-[var(--color-arc-purple-light)]')}><MessageCircle className="size-6" /></button><ChatDrawer open={open} onClose={()=>setOpen(false)} /></>; }
