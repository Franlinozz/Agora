'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@agora/ui';

const walletConnectProjectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'agora-dev-placeholder';
const queryClient = new QueryClient();

function WalletBoundary({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  return <WalletProvider walletConnectProjectId={walletConnectProjectId}>{children}</WalletProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletBoundary>{children}</WalletBoundary>
    </QueryClientProvider>
  );
}
