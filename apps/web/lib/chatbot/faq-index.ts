export type FaqItem = { question: string; answer: string; embedding: number[] };
let cache: FaqItem[] | null = null;
export async function loadFaq(){ if(cache) return cache; const res=await fetch('/chatbot-faq.json'); cache=(await res.json()) as FaqItem[]; return cache; }
function score(a:string,b:string){ const aw=new Set(a.toLowerCase().split(/\W+/)); const bw=b.toLowerCase().split(/\W+/); return bw.filter((w)=>aw.has(w)).length/Math.max(1,bw.length); }
export async function askFaq(question:string){ const faq=await loadFaq(); const best=faq.map((item)=>({item,s:score(item.question,question)})).sort((a,b)=>b.s-a.s)[0]; return best && best.s>0.35 ? best.item.answer : null; }
