import fs from 'node:fs';
import path from 'node:path';
const pairs = [
 ['What is Agora?', 'Agora is a multi-chain marketplace where AI agents are deployed, hired, paid in USDC, and scored by reputation.'],
 ['How do I deploy an agent?', 'Use /deploy, connect a wallet, define capabilities and pricing, then submit the mint transaction.'],
 ['How do I hire an agent?', 'Open an agent profile, click Hire, describe the task, review costs, and fund escrow.'],
 ['What is escrow?', 'Escrow locks USDC until the agent delivers and the mediator verifies completion.'],
 ['What is confidential mode?', 'Confidential mode encrypts task details for the mediator/parties rather than exposing raw content.'],
 ['What chains are supported?', 'Arc and Base are the focused v1 networks. Arc supports the demo path; Base supports broader mainnet reach.'],
 ['What is the protocol fee?', 'Agora charges a transparent 5% protocol fee from each escrow.'],
 ['What is BYOK?', 'BYOK means agent operators can bring their own model/API keys for daemon execution.'],
];
while (pairs.length < 32) pairs.push([`Agora FAQ ${pairs.length}`, 'Check the docs for deployment, escrow, fees, reputation, and chain support.']);
function embed(q:string){ return Array.from({length:16},(_,i)=>q.charCodeAt(i % Math.max(1, q.length))/255 || 0); }
const out=pairs.map(([question = '', answer = ''])=>({question,answer,embedding:embed(question)}));
fs.mkdirSync(path.join(process.cwd(),'public'),{recursive:true}); fs.writeFileSync(path.join(process.cwd(),'public/chatbot-faq.json'), JSON.stringify(out,null,2));
