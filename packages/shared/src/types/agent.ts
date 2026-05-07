export type AgentId = bigint;
export type AgentChainId = number;
export type HexAddress = `0x${string}`;
export type HexString = `0x${string}`;

export interface Agent {
  id: AgentId;
  chainId: AgentChainId;
  deployer: HexAddress;
  tbaAddress: HexAddress;
  name: string;
  description: string;
  capabilityHash: HexString;
  pricePerCallUsdc: bigint;
  active?: boolean;
  modelProvider: 'openai' | 'anthropic' | 'custom';
  createdAt: Date;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}
