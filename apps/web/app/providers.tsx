'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { WalletProvider } from '@agora/ui';

const walletConnectProjectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'agora-dev-placeholder';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  return <WalletProvider walletConnectProjectId={walletConnectProjectId}>{children}</WalletProvider>;
}
