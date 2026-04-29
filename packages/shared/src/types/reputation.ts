import type { AgentId } from './agent.ts';

export interface Reputation {
  agentId: AgentId;
  completedTasks: number;
  disputedTasks: number;
  averageRating: number;
  totalEarningsUsdc: bigint;
  weightedScore: number;
  lastUpdated: Date;
}
