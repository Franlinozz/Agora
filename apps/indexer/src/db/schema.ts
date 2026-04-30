import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const chains = pgTable('chains', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  environment: text('environment').notNull(),
  lastIndexedBlock: bigint('last_indexed_block', { mode: 'bigint' })
    .default(sql`0`)
    .notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agents = pgTable(
  'agents',
  {
    pk: serial('pk').primaryKey(),
    chainId: text('chain_id')
      .notNull()
      .references(() => chains.id),
    onchainId: bigint('onchain_id', { mode: 'bigint' }).notNull(),
    deployer: text('deployer').notNull(),
    tba: text('tba').notNull(),
    metadataURI: text('metadata_uri').notNull(),
    name: text('name'),
    description: text('description'),
    capabilityHash: text('capability_hash').notNull(),
    pricePerCallUsdc: bigint('price_per_call_usdc', { mode: 'bigint' }).notNull(),
    active: boolean('active').default(true).notNull(),
    deployTxHash: text('deploy_tx_hash').notNull(),
    deployBlock: bigint('deploy_block', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    chainOnchainIdx: uniqueIndex('agents_chain_onchain_idx').on(t.chainId, t.onchainId),
    deployerIdx: index('agents_deployer_idx').on(t.deployer),
  }),
);

export const escrows = pgTable(
  'escrows',
  {
    pk: serial('pk').primaryKey(),
    chainId: text('chain_id')
      .notNull()
      .references(() => chains.id),
    onchainId: bigint('onchain_id', { mode: 'bigint' }).notNull(),
    agentPk: integer('agent_pk').references(() => agents.pk),
    buyer: text('buyer').notNull(),
    amountUsdc: bigint('amount_usdc', { mode: 'bigint' }).notNull(),
    taskHash: text('task_hash').notNull(),
    deliveryHash: text('delivery_hash'),
    state: integer('state').notNull(),
    confidential: boolean('confidential').default(false).notNull(),
    deadline: timestamp('deadline').notNull(),
    createTxHash: text('create_tx_hash').notNull(),
    createBlock: bigint('create_block', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    chainOnchainIdx: uniqueIndex('escrows_chain_onchain_idx').on(t.chainId, t.onchainId),
    buyerIdx: index('escrows_buyer_idx').on(t.buyer),
    stateIdx: index('escrows_state_idx').on(t.state),
  }),
);

export const reputations = pgTable(
  'reputations',
  {
    pk: serial('pk').primaryKey(),
    agentPk: integer('agent_pk')
      .notNull()
      .references(() => agents.pk),
    completedTasks: integer('completed_tasks').default(0).notNull(),
    disputedTasks: integer('disputed_tasks').default(0).notNull(),
    averageRatingBps: integer('average_rating_bps').default(0).notNull(),
    totalEarningsUsdc: bigint('total_earnings_usdc', { mode: 'bigint' })
      .default(sql`0`)
      .notNull(),
    weightedScore: bigint('weighted_score', { mode: 'bigint' })
      .default(sql`0`)
      .notNull(),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  (t) => ({
    agentIdx: uniqueIndex('reputations_agent_idx').on(t.agentPk),
  }),
);

export const events = pgTable(
  'events',
  {
    pk: serial('pk').primaryKey(),
    chainId: text('chain_id')
      .notNull()
      .references(() => chains.id),
    blockNumber: bigint('block_number', { mode: 'bigint' }).notNull(),
    txHash: text('tx_hash').notNull(),
    logIndex: integer('log_index').notNull(),
    contractAddress: text('contract_address').notNull(),
    eventName: text('event_name').notNull(),
    args: jsonb('args').notNull(),
    confirmations: integer('confirmations').default(0).notNull(),
    confirmed: boolean('confirmed').default(true).notNull(),
    timestamp: timestamp('timestamp').notNull(),
  },
  (t) => ({
    chainBlockIdx: index('events_chain_block_idx').on(t.chainId, t.blockNumber),
    uniqueEvent: uniqueIndex('events_unique_idx').on(t.chainId, t.txHash, t.logIndex),
  }),
);

export const subscribers = pgTable('subscribers', {
  pk: serial('pk').primaryKey(),
  email: text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
});

export const llmSpend = pgTable('llm_spend', {
  pk: serial('pk').primaryKey(),
  dateUtc: text('date_utc').notNull().unique(),
  centsSpent: integer('cents_spent').default(0).notNull(),
  callsMade: integer('calls_made').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
