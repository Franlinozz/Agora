import { arcConfig } from '@agora/chains';

import { DeliveryViewer } from '@/components/escrow/DeliveryViewer';
import { DisputeModal } from '@/components/escrow/DisputeModal';
import { EscrowHeader, type EscrowDetail } from '@/components/escrow/EscrowHeader';
import { MediatorLog } from '@/components/escrow/MediatorLog';
import { StateMachine } from '@/components/escrow/StateMachine';

function mockEscrow(id: string): EscrowDetail {
  return {
    id,
    chainId: Number(arcConfig.id),
    buyer: '0x1111111111111111111111111111111111111111',
    agentOwner: '0x2222222222222222222222222222222222222222',
    agentName: `Agora Agent #${id}`,
    amountUsdc: '1000000',
    taskHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    deliveryHash: null,
    state: 1,
    confidential: false,
  };
}

export default function EscrowPage({ params }: { params: { id: string } }) {
  const escrow = mockEscrow(params.id);
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <EscrowHeader escrow={escrow} />
          <StateMachine state={escrow.state} />
          <DeliveryViewer escrow={escrow} />
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <MediatorLog escrowId={params.id} />
          <DisputeModal escrowId={params.id} buyer={escrow.buyer} agentOwner={escrow.agentOwner} />
        </aside>
      </div>
    </section>
  );
}
