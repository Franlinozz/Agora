import { notFound } from 'next/navigation';

import { arcConfig, baseConfig } from '@agora/chains';

const VM_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const VM_SECRET = process.env.API_GATEWAY_SECRET || '';

export type ApiAgent = {
  pk: number;
  chainId: string;
  onchainId: string;
  deployer: `0x${string}`;
  tba: `0x${string}`;
  metadataURI: string;
  name: string | null;
  description: string | null;
  capabilityHash: `0x${string}`;
  pricePerCallUsdc: string;
  active: boolean;
  deployTxHash: `0x${string}`;
  deployBlock: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiReputation = {
  completedTasks: number;
  disputedTasks: number;
  averageRatingBps?: number;
  averageRating?: number;
  totalEarningsUsdc: string;
  weightedScore: number;
  lastUpdated?: string;
} | null;

export type ApiAgentDetail = {
  agent: ApiAgent;
  reputation: ApiReputation;
};

export type AgentMetadataCapability = {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
};

export type AgentMetadata = {
  name?: string;
  description?: string;
  capabilities?: AgentMetadataCapability[];
};

export function chainIdToNumber(chainId: string | number): number {
  if (typeof chainId === 'number') return chainId;
  if (chainId === arcConfig.name) return Number(arcConfig.id);
  if (chainId === baseConfig.name || chainId === String(baseConfig.id)) return Number(baseConfig.id);
  const parsed = Number(chainId);
  return Number.isFinite(parsed) ? parsed : Number(arcConfig.id);
}

export function parseAgentMetadata(metadataURI: string): AgentMetadata {
  if (!metadataURI.startsWith('data:application/json;base64,')) return {};
  try {
    const encoded = metadataURI.replace('data:application/json;base64,', '');
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const metadata = JSON.parse(decoded) as AgentMetadata;
    return metadata && typeof metadata === 'object' ? metadata : {};
  } catch {
    return {};
  }
}

export async function fetchAgentDetail(agentRef: string): Promise<ApiAgentDetail> {
  if (agentRef.includes(':')) {
    const [chainId, onchainId] = agentRef.split(':', 2);
    if (!chainId || !onchainId) notFound();
    const agent = await findAgentByChainAndOnchainId(chainId, onchainId);
    if (!agent) notFound();
    return fetchAgentDetail(String(agent.pk));
  }

  const response = await vmFetch(`/agents/${encodeURIComponent(agentRef)}`);
  if (response.status === 404) {
    const agent = await findAgentByOnchainId(agentRef);
    if (!agent) notFound();
    return fetchAgentDetail(String(agent.pk));
  }
  if (!response.ok) throw new Error(`Failed to load agent ${agentRef}`);
  return (await response.json()) as ApiAgentDetail;
}

async function findAgentByChainAndOnchainId(chainId: string, onchainId: string): Promise<ApiAgent | null> {
  const response = await vmFetch(`/agents?chain=${encodeURIComponent(chainId)}&limit=100`);
  if (!response.ok) return null;
  const data = (await response.json()) as { agents?: ApiAgent[] };
  return data.agents?.find((agent) => agent.onchainId === onchainId) ?? null;
}

async function findAgentByOnchainId(onchainId: string): Promise<ApiAgent | null> {
  const response = await vmFetch('/agents?limit=100');
  if (!response.ok) return null;
  const data = (await response.json()) as { agents?: ApiAgent[] };
  return data.agents?.find((agent) => agent.onchainId === onchainId) ?? null;
}

async function vmFetch(path: string): Promise<Response> {
  const headers: HeadersInit = { accept: 'application/json' };
  if (VM_SECRET) headers['x-gateway-secret'] = VM_SECRET;
  return fetch(`${VM_URL}${path}`, { headers, cache: 'no-store' });
}
