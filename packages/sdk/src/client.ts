
import { getChainOrThrow } from '@agora/chains';
import { encryptForRecipient } from '@agora/shared';
import { keccak256, stringToHex, type Account, type Hash, type Hex, type WalletClient } from 'viem';

import * as agentContract from './contracts/agentRegistry.ts';
import * as escrowContract from './contracts/escrowManager.ts';
import * as reputationContract from './contracts/reputationOracle.ts';
import type {
  AgoraClientConfig,
  CreateEscrowParams,
  DeployAgentParams,
  HireResult,
} from './types.ts';

export class AgoraClient {
  private defaultChainId: number | string;
  private account?: Account;
  private walletClient?: WalletClient;

  /** Create a new Agora SDK client and validate the default chain. */
  constructor(config: AgoraClientConfig) {
    this.defaultChainId = config.defaultChainId;
    this.account = config.account;
    this.walletClient = config.walletClient;
    getChainOrThrow(this.defaultChainId);
  }

  /** Set or replace the wallet account used for write methods. */
  setAccount(account: Account): void {
    this.account = account;
  }

  /** Deploy a new agent NFT and token-bound account on the selected chain. */
  async deployAgent(params: DeployAgentParams, chainId?: number | string) {
    const signer = this.getSigner();
    const targetChainId = chainId ?? this.defaultChainId;
    const metadataURI = this.buildMetadataURI(params);
    const capabilityHash = this.hashCapabilities(params.capabilities);

    return agentContract.deployAgent(targetChainId, signer, {
      metadataURI,
      capabilityHash,
      pricePerCallUsdc: params.pricePerCallUsdc,
    });
  }

  /** Hire an agent by creating and funding an escrow, optionally encrypting the task. */
  async hire(params: CreateEscrowParams, mediatorPublicKey?: Uint8Array): Promise<HireResult> {
    const signer = this.getSigner();
    const chainId = params.chainId ?? this.defaultChainId;
    const taskHash = this.hashTask(params.taskDescription);
    let encryptedTaskBlob: Hex = '0x';

    if (params.confidential) {
      if (!mediatorPublicKey) throw new Error('Mediator public key required for confidential tasks');
      const encrypted = encryptForRecipient(params.taskDescription, mediatorPublicKey);
      encryptedTaskBlob = `0x${this.base64ToHex(encrypted)}`;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + params.deadlineDays * 86_400);
    return escrowContract.createEscrow(chainId, signer, {
      agentId: params.agentId,
      taskHash,
      amountUsdc: params.amountUsdc,
      deadline,
      confidential: params.confidential,
      encryptedTaskBlob,
    });
  }

  /** Read one agent by id from a chain. */
  async getAgent(agentId: bigint, chainId?: number | string) {
    return agentContract.getAgent(chainId ?? this.defaultChainId, agentId);
  }

  /** Read one escrow by id from a chain. */
  async getEscrow(escrowId: bigint, chainId?: number | string) {
    return escrowContract.getEscrow(chainId ?? this.defaultChainId, escrowId);
  }

  /** Read reputation for an agent from a chain. */
  async getReputation(agentId: bigint, chainId?: number | string) {
    return reputationContract.getReputation(chainId ?? this.defaultChainId, agentId);
  }

  /** List recent agents from newest to oldest. */
  async listAgents(chainId?: number | string, limit = 50, offset = 0) {
    const targetChainId = chainId ?? this.defaultChainId;
    const total = await agentContract.totalAgents(targetChainId);
    const ids: bigint[] = [];
    const first = total - BigInt(offset);

    for (let id = first; id > 0n && ids.length < limit; id--) {
      ids.push(id);
    }

    return Promise.all(ids.map((id) => this.getAgent(id, targetChainId)));
  }

  private requireAccount(): Account {
    if (!this.account) throw new Error('No account set');
    return this.account;
  }

  private getSigner(): Account | WalletClient {
    if (this.walletClient) return this.walletClient;
    if (this.account) return this.account;
    throw new Error('No account or wallet client set');
  }

  private buildMetadataURI(params: DeployAgentParams): string {
    const metadata = {
      name: params.name,
      description: params.description,
      modelProvider: params.modelProvider,
      capabilities: params.capabilities,
    };
    return `data:application/json;base64,${this.base64Encode(JSON.stringify(metadata))}`;
  }

  private hashCapabilities(capabilities: unknown[]): Hash {
    return keccak256(stringToHex(JSON.stringify(capabilities)));
  }

  private hashTask(description: string): Hash {
    return keccak256(stringToHex(description));
  }

  private base64Encode(value: string): string {
    if (typeof globalThis.btoa === 'function') return globalThis.btoa(value);
    return Buffer.from(value, 'utf8').toString('base64');
  }

  private base64ToHex(value: string): string {
    if (typeof Buffer !== 'undefined') return Buffer.from(value, 'base64').toString('hex');
    const binary = globalThis.atob(value);
    return Array.from(binary, (char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  }
}
