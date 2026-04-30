'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button, cn } from '@agora/ui';
import { MessageBubble, type ChatMessage } from './MessageBubble';
import { askFaq } from '@/lib/chatbot/faq-index';

type StoredMessage = ChatMessage & { id: string };
export function ChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages,setMessages]=useState<StoredMessage[]>([]); const [input,setInput]=useState(''); const [loading,setLoading]=useState(false); const endRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(open){ setMessages(JSON.parse(sessionStorage.getItem('agora-chat')||'[]') as StoredMessage[]); }},[open]);
  useEffect(()=>{ sessionStorage.setItem('agora-chat', JSON.stringify(messages.slice(-50))); endRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);
  async function send(e:React.FormEvent){ e.preventDefault(); const question=input.trim(); if(!question) return; const user={id:`u-${Date.now()}`,role:'user' as const,content:question}; setMessages((m)=>[...m,user]); setInput(''); setLoading(true); try { const faq=await askFaq(question); let answer: string = faq ?? ''; if(!answer){ const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,history:messages.slice(-8)})}); const data=await res.json(); answer=data.message||data.answer||"I'm taking a break for the day. Try the docs or Discord."; } setMessages((m)=>[...m,{id:`b-${Date.now()}`,role:'bot',content:answer}]); } finally { setLoading(false); } }
  return <aside className={cn('fixed bottom-0 right-0 z-50 flex h-[min(720px,100vh)] w-[min(380px,100vw)] translate-x-full flex-col border-l border-[var(--color-bg-3)] bg-[var(--color-bg-0)] shadow-2xl transition', open && 'translate-x-0')}><header className="flex items-center justify-between border-b border-[var(--color-bg-3)] p-4"><h2 className="font-semibold">Ask Agora</h2><button onClick={onClose} aria-label="Close"><X className="size-5" /></button></header><div className="flex-1 space-y-3 overflow-auto p-4">{messages.length===0?<MessageBubble role="bot" content="Ask me about deploying agents, escrow, fees, supported chains, or confidential mode." />:null}{messages.map((m)=><MessageBubble key={m.id} role={m.role} content={m.content}/>)}{loading?<MessageBubble role="bot" content="Thinking…"/>:null}<div ref={endRef}/></div><form onSubmit={send} className="flex gap-2 border-t border-[var(--color-bg-3)] p-3"><input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-3 outline-none"/><Button type="submit" size="sm"><Send className="size-4" /></Button></form></aside>;
}
