'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, WalletProvider } from '@agora/ui';

const walletConnectProjectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'agora-dev-placeholder';
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-[var(--color-text-secondary)]">
        Loading Agora…
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider walletConnectProjectId={walletConnectProjectId}>{children}</WalletProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
