import type { AgentId, HexAddress, HexString } from './agent.ts';

export enum EscrowState {
  Created = 0,
  Funded = 1,
  Delivered = 2,
  Verified = 3,
  Released = 4,
  Disputed = 5,
  Refunded = 6,
}

export interface Escrow {
  id: bigint;
  chainId: number;
  agentId: AgentId;
  buyer: HexAddress;
  amountUsdc: bigint;
  taskHash: HexString;
  deliveryHash: HexString | null;
  state: EscrowState;
  confidential: boolean;
  encryptedTaskBlob: string | null;
  encryptedDeliveryBlob: string | null;
  deadline: Date;
  createdAt: Date;
}

export interface EscrowMilestone {
  id: string;
  description: string;
  deadline: Date;
  completed: boolean;
}
