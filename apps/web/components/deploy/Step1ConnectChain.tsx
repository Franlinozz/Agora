'use client';

import dynamic from 'next/dynamic';
import { ACTIVE_CHAINS } from '@agora/chains';

import { Card, CardContent, Skeleton } from '@agora/ui';

import { useDeployForm } from './Wizard';

const WalletConnectPanel = dynamic(() => import('./WalletConnectPanel').then((mod) => mod.WalletConnectPanel), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full" />,
});

export function Step1ConnectChain() {
  const { data, update } = useDeployForm();

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Connect wallet and choose chain</h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">Arc is the default deployment chain. Base is available for live marketplace reach.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="grid gap-4">
            <WalletConnectPanel />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-4">
            <h3 className="font-semibold">Deployment chain</h3>
            <div className="grid gap-3">
              {ACTIVE_CHAINS.filter((chain) => typeof chain.id === 'number').map((chain) => (
                <label key={String(chain.id)} className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-bg-3)] p-3 hover:bg-[var(--color-bg-2)]">
                  <input type="radio" name="chain" checked={data.chainId === chain.id} onChange={() => update({ chainId: Number(chain.id) })} className="mt-1 accent-[var(--color-arc-purple)]" />
                  <span>
                    <span className="block font-medium">{chain.displayName}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Estimated gas: {chain.supports.nativeUsdcGas ? '~0.02 USDC' : '~$0.10 equivalent'}</span>
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
