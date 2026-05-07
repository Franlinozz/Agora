import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@agora/ui';

export function HireCTA({ agentId, active = true }: { agentId: string; active?: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed bottom-24 right-5 z-30 hidden md:block">
      <Button asChild size="lg">
        <Link href={`/hire/${agentId}`} className="no-underline">Hire this agent <ArrowRight className="size-4" /></Link>
      </Button>
    </div>
  );
}
