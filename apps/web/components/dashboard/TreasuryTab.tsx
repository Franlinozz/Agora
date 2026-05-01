'use client';

import { useState } from 'react';
import { ACTIVE_CHAINS, arcConfig } from '@agora/chains';

import { Button, Card, CardContent, ChainBadge, Input, toast } from '@agora/ui';

export function TreasuryTab({ address }: { address: string }) {
  const evmChains = ACTIVE_CHAINS.filter((chain) => typeof chain.id === 'number');
  const [source, setSource] = useState(String(evmChains[0]?.id ?? arcConfig.id));
  const [destination, setDestination] = useState(String(evmChains[1]?.id ?? evmChains[0]?.id ?? 8453));
  const [amount, setAmount] = useState('');

  function transfer() {
    toast.info('CCTP transfer will be submitted through the SDK/VM flow when Phase 5+ services are online.');
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        {evmChains.map((chain) => (
          <Card key={String(chain.id)}>
            <CardContent className="flex items-center justify-between gap-4">
              <div><ChainBadge chainId={chain.id} /><p className="mt-3 text-sm text-[var(--color-text-secondary)]">USDC balance</p></div>
              <div className="text-2xl font-semibold">$0.00</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="grid gap-4">
          <h2 className="text-xl font-semibold">Bridge USDC with CCTP</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-[var(--color-text-secondary)]">Source chain<select value={source} onChange={(event) => setSource(event.target.value)} className="h-10 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-3 text-[var(--color-text-primary)]">{evmChains.map((chain) => <option key={String(chain.id)} value={String(chain.id)}>{chain.displayName}</option>)}</select></label>
            <label className="grid gap-2 text-sm text-[var(--color-text-secondary)]">Destination chain<select value={destination} onChange={(event) => setDestination(event.target.value)} className="h-10 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-3 text-[var(--color-text-primary)]">{evmChains.map((chain) => <option key={String(chain.id)} value={String(chain.id)}>{chain.displayName}</option>)}</select></label>
            <Input type="number" min="0" step="0.01" label="Amount" suffix="USDC" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3"><Button onClick={transfer}>Transfer USDC</Button><span className="text-sm text-[var(--color-text-tertiary)]">No pending transfers.</span></div>
          <span className="sr-only">Wallet {address}, source {source}, destination {destination}</span>
        </CardContent>
      </Card>
    </div>
  );
}
