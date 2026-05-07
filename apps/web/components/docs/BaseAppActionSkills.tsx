'use client';

import { useMemo, useState } from 'react';
import { useAccount, useChainId, useSendTransaction, useSwitchChain, useWalletClient } from 'wagmi';
import { encodePacked, keccak256, stringToHex, type Hash, type Hex, type WalletClient } from 'viem';
import { appendBaseAttribution, baseConfig } from '@agora/sdk';

import { Button, Card, CardContent, toast } from '@agora/ui';

type SkillId = 'eth-price' | 'leaderboard' | 'agent-discovery';
type SkillStatus = 'idle' | 'querying' | 'ready' | 'signing' | 'confirmed' | 'error';

type SkillResult = {
  title: string;
  summary: string;
  payload: Record<string, unknown>;
};

type TxRecord = {
  hash: Hash;
  explorerUrl: string;
};

type LeaderboardEntry = {
  agent?: {
    name?: string | null;
    onchainId?: string;
    chainId?: string;
    active?: boolean;
  };
  reputation?: {
    weightedScore?: string | number;
    completedTasks?: number;
  } | null;
};

type AgentRow = {
  name?: string | null;
  chainId?: string;
  active?: boolean;
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const BASE_ID = Number(baseConfig.id);

const skillCopy: Record<SkillId, { eyebrow: string; title: string; description: string; button: string }> = {
  'eth-price': {
    eyebrow: 'Market pulse',
    title: 'ETH price checkpoint',
    description: 'Fetch the live ETH/USD price, then mint a zero-value Base receipt that proves someone used Agora to query market context.',
    button: 'Query ETH price',
  },
  leaderboard: {
    eyebrow: 'Marketplace pulse',
    title: 'Leaderboard checkpoint',
    description: 'Read Agora’s current active leaderboard, hash the top agents, then record a compact Base receipt for the query.',
    button: 'Query leaderboard',
  },
  'agent-discovery': {
    eyebrow: 'Discovery pulse',
    title: 'Agent discovery checkpoint',
    description: 'Query live marketplace availability across Base and Arc, then record a Base receipt for real marketplace discovery.',
    button: 'Query agents',
  },
};

export function BaseAppActionSkills() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { data: walletClient } = useWalletClient();
  const [results, setResults] = useState<Partial<Record<SkillId, SkillResult>>>({});
  const [statuses, setStatuses] = useState<Record<SkillId, SkillStatus>>({
    'eth-price': 'idle',
    leaderboard: 'idle',
    'agent-discovery': 'idle',
  });
  const [transactions, setTransactions] = useState<Partial<Record<SkillId, TxRecord>>>({});
  const [errors, setErrors] = useState<Partial<Record<SkillId, string>>>({});

  const connectedToBase = chainId === BASE_ID;
  const account = walletClient?.account?.address ?? address;
  const explorerRoot = useMemo(() => baseConfig.explorerUrl.replace(/\/$/, ''), []);

  function setSkillStatus(skill: SkillId, status: SkillStatus) {
    setStatuses((current) => ({ ...current, [skill]: status }));
  }

  async function runQuery(skill: SkillId) {
    setErrors((current) => ({ ...current, [skill]: undefined }));
    setTransactions((current) => ({ ...current, [skill]: undefined }));
    setSkillStatus(skill, 'querying');

    try {
      const result = await querySkill(skill);
      setResults((current) => ({ ...current, [skill]: result }));
      setSkillStatus(skill, 'ready');
      toast.success(`${result.title} ready. Sign the Base receipt to record it onchain.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not run this action.';
      setErrors((current) => ({ ...current, [skill]: message }));
      setSkillStatus(skill, 'error');
      toast.error(message);
    }
  }

  async function signReceipt(skill: SkillId) {
    const result = results[skill];
    if (!result) {
      toast.error('Run the query first, then sign the receipt.');
      return;
    }

    if (!account || !isConnected) {
      toast.error('Connect a wallet inside Base App before signing.');
      return;
    }

    setErrors((current) => ({ ...current, [skill]: undefined }));
    setSkillStatus(skill, 'signing');

    try {
      if (chainId !== BASE_ID) {
        if (!switchChainAsync) throw new Error('Switch your wallet to Base before signing this receipt.');
        await switchChainAsync({ chainId: BASE_ID });
      }

      const receipt = buildReceipt(skill, account, result);
      const txHash = await sendBaseReceiptTransaction({
        account,
        data: receipt.data,
        walletClient,
        sendTransactionAsync,
      });

      setTransactions((current) => ({ ...current, [skill]: { hash: txHash, explorerUrl: `${explorerRoot}/tx/${txHash}` } }));
      setSkillStatus(skill, 'confirmed');
      toast.success('Base receipt submitted. This should count as Base App activity when opened from Base App.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wallet rejected or failed to submit the receipt.';
      setErrors((current) => ({ ...current, [skill]: message }));
      setSkillStatus(skill, 'error');
      toast.error(message);
    }
  }

  return (
    <div className="not-prose mt-8 grid min-w-0 gap-5">
      <div className="min-w-0 rounded-2xl border border-[var(--color-arc-purple)]/30 bg-[var(--color-arc-purple)]/10 p-4 sm:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-arc-purple-light)]">{'// Interactive Base App actions'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)] sm:text-3xl">Useful queries that end in real Base transactions.</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          These are zero-value onchain receipts, not agent deployments. Query something useful, then sign a Base transaction with Agora Builder Code attribution. You still pay normal Base gas.
        </p>
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {account ? `Connected wallet: ${account.slice(0, 6)}…${account.slice(-4)}` : 'Connect from the Base App browser for the cleanest Base App attribution.'} {connectedToBase ? 'Base is selected.' : 'Switch to Base before signing.'}
        </p>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        {(Object.keys(skillCopy) as SkillId[]).map((skill) => {
          const copy = skillCopy[skill];
          const status = statuses[skill];
          const result = results[skill];
          const tx = transactions[skill];
          const error = errors[skill];
          const queryLoading = status === 'querying';
          const signLoading = status === 'signing';

          return (
            <Card key={skill} variant="outlined" className="h-full min-w-0 overflow-hidden">
              <CardContent className="flex h-full min-w-0 flex-col gap-4 p-4 sm:p-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-arc-purple-light)]">{copy.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">{copy.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{copy.description}</p>
                </div>

                {result ? (
                  <div className="rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-2)] p-3 text-sm">
                    <div className="font-semibold text-[var(--color-text-primary)]">{result.title}</div>
                    <p className="mt-1 break-words leading-6 text-[var(--color-text-secondary)]">{result.summary}</p>
                  </div>
                ) : null}

                {tx ? (
                  <a className="break-all text-xs text-[var(--color-success)] no-underline hover:underline" href={tx.explorerUrl} target="_blank" rel="noreferrer">
                    Receipt tx: {tx.hash}
                  </a>
                ) : null}

                {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

                <div className="mt-auto grid gap-2">
                  <Button variant="secondary" onClick={() => void runQuery(skill)} loading={queryLoading}>{copy.button}</Button>
                  <Button onClick={() => void signReceipt(skill)} loading={signLoading} disabled={!result || signLoading}>
                    {status === 'confirmed' ? 'Sign another receipt' : 'Sign Base receipt'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

async function querySkill(skill: SkillId): Promise<SkillResult> {
  if (skill === 'eth-price') return queryEthPrice();
  if (skill === 'leaderboard') return queryLeaderboard();
  return queryAgentDiscovery();
}

async function queryEthPrice(): Promise<SkillResult> {
  const body = await fetchEthPrice();
  const amount = body.amount;
  if (!amount) throw new Error('ETH price response was incomplete.');
  const rounded = Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const observedAt = body.observedAt ?? new Date().toISOString();

  return {
    title: `ETH is $${rounded}`,
    summary: `Fetched from ${body.source ?? 'market data provider'} at ${new Date(observedAt).toUTCString()}.`,
    payload: { source: body.source ?? 'coinbase', pair: 'ETH-USD', amount, currency: body.currency ?? 'USD', observedAt },
  };
}

async function fetchEthPrice(): Promise<{ amount?: string; currency?: string; source?: string; observedAt?: string }> {
  const apiResult = await fetch('/api/market/eth-price', { cache: 'no-store' })
    .then(async (response) => (response.ok ? response.json() as Promise<{ amount?: string; currency?: string; source?: string; observedAt?: string }> : null))
    .catch(() => null);
  if (apiResult?.amount) return apiResult;

  const coinGeckoResult = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', { cache: 'no-store' })
    .then(async (response) => (response.ok ? response.json() as Promise<{ ethereum?: { usd?: number } }> : null))
    .catch(() => null);
  const amount = coinGeckoResult?.ethereum?.usd;
  if (amount && Number.isFinite(amount)) {
    return { amount: amount.toString(), currency: 'USD', source: 'coingecko-client', observedAt: new Date().toISOString() };
  }

  throw new Error('ETH price API is unavailable right now.');
}

async function queryLeaderboard(): Promise<SkillResult> {
  const response = await fetch('/api/leaderboard?limit=5', { cache: 'no-store' });
  if (!response.ok) throw new Error('Agora leaderboard is unavailable right now.');
  const body = (await response.json()) as { entries?: LeaderboardEntry[] };
  const entries = body.entries ?? [];
  const top = entries.map((entry, index) => ({
    rank: index + 1,
    name: entry.agent?.name ?? `Agent #${entry.agent?.onchainId ?? index + 1}`,
    chainId: entry.agent?.chainId,
    score: entry.reputation?.weightedScore ?? 0,
    completedTasks: entry.reputation?.completedTasks ?? 0,
  }));
  const names = top.map((agent) => agent.name).join(', ') || 'No active agents yet';

  return {
    title: `${top.length} leaderboard agents checked`,
    summary: `Top active agents: ${names}.`,
    payload: { source: 'agora-leaderboard', top, observedAt: new Date().toISOString() },
  };
}

async function queryAgentDiscovery(): Promise<SkillResult> {
  const response = await fetch('/api/agents?limit=24', { cache: 'no-store' });
  if (!response.ok) throw new Error('Agora marketplace is unavailable right now.');
  const body = (await response.json()) as { agents?: AgentRow[]; total?: number };
  const agents = body.agents ?? [];
  const byChain = agents.reduce<Record<string, number>>((acc, agent) => {
    const chain = agent.chainId ?? 'unknown';
    acc[chain] = (acc[chain] ?? 0) + 1;
    return acc;
  }, {});

  return {
    title: `${body.total ?? agents.length} live agents discovered`,
    summary: `Active marketplace snapshot: ${Object.entries(byChain).map(([chain, count]) => `${chain}: ${count}`).join(', ') || 'no active agents'}.`,
    payload: { source: 'agora-agents', total: body.total ?? agents.length, byChain, observedAt: new Date().toISOString() },
  };
}

async function sendBaseReceiptTransaction({
  account,
  data,
  walletClient,
  sendTransactionAsync,
}: {
  account: `0x${string}`;
  data: Hex;
  walletClient?: WalletClient | null;
  sendTransactionAsync: (request: { to: `0x${string}`; value: bigint; data: Hex }) => Promise<Hash>;
}): Promise<Hash> {
  const attributedData = appendBaseAttribution(BASE_ID, data);

  if (walletClient?.account) {
    return walletClient.sendTransaction({ account: walletClient.account, chain: null, to: account, value: 0n, data: attributedData });
  }

  try {
    return await sendTransactionAsync({ to: account, value: 0n, data });
  } catch (error) {
    const provider = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (!provider) throw error;

    const hash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{ from: account, to: account, value: '0x0', data: attributedData }],
    });
    if (typeof hash !== 'string' || !hash.startsWith('0x')) throw error;
    return hash as Hash;
  }
}

function buildReceipt(skill: SkillId, wallet: `0x${string}`, result: SkillResult): { data: Hex; digest: Hex } {
  const compactPayload = {
    app: 'agora',
    kind: 'base-app-action-skill',
    version: 1,
    skill,
    wallet,
    title: result.title,
    payload: result.payload,
  };
  const json = JSON.stringify(compactPayload);
  const digest = keccak256(stringToHex(json));
  const data = encodePacked(
    ['string', 'bytes32'],
    [`AGORA_SKILL:${skill}:`, digest],
  );

  return { digest, data };
}
