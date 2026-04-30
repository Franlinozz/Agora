CREATE TABLE IF NOT EXISTS "agents" (
	"pk" serial PRIMARY KEY NOT NULL,
	"chain_id" text NOT NULL,
	"onchain_id" bigint NOT NULL,
	"deployer" text NOT NULL,
	"tba" text NOT NULL,
	"metadata_uri" text NOT NULL,
	"name" text,
	"description" text,
	"capability_hash" text NOT NULL,
	"price_per_call_usdc" bigint NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"deploy_tx_hash" text NOT NULL,
	"deploy_block" bigint NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chains" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"environment" text NOT NULL,
	"last_indexed_block" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "escrows" (
	"pk" serial PRIMARY KEY NOT NULL,
	"chain_id" text NOT NULL,
	"onchain_id" bigint NOT NULL,
	"agent_pk" integer,
	"buyer" text NOT NULL,
	"amount_usdc" bigint NOT NULL,
	"task_hash" text NOT NULL,
	"delivery_hash" text,
	"state" integer NOT NULL,
	"confidential" boolean DEFAULT false NOT NULL,
	"deadline" timestamp NOT NULL,
	"create_tx_hash" text NOT NULL,
	"create_block" bigint NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"pk" serial PRIMARY KEY NOT NULL,
	"chain_id" text NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"contract_address" text NOT NULL,
	"event_name" text NOT NULL,
	"args" jsonb NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "llm_spend" (
	"pk" serial PRIMARY KEY NOT NULL,
	"date_utc" text NOT NULL,
	"cents_spent" integer DEFAULT 0 NOT NULL,
	"calls_made" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "llm_spend_date_utc_unique" UNIQUE("date_utc")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reputations" (
	"pk" serial PRIMARY KEY NOT NULL,
	"agent_pk" integer NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"disputed_tasks" integer DEFAULT 0 NOT NULL,
	"average_rating_bps" integer DEFAULT 0 NOT NULL,
	"total_earnings_usdc" bigint DEFAULT 0 NOT NULL,
	"weighted_score" bigint DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscribers" (
	"pk" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_chain_id_chains_id_fk" FOREIGN KEY ("chain_id") REFERENCES "public"."chains"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "escrows" ADD CONSTRAINT "escrows_chain_id_chains_id_fk" FOREIGN KEY ("chain_id") REFERENCES "public"."chains"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "escrows" ADD CONSTRAINT "escrows_agent_pk_agents_pk_fk" FOREIGN KEY ("agent_pk") REFERENCES "public"."agents"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_chain_id_chains_id_fk" FOREIGN KEY ("chain_id") REFERENCES "public"."chains"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reputations" ADD CONSTRAINT "reputations_agent_pk_agents_pk_fk" FOREIGN KEY ("agent_pk") REFERENCES "public"."agents"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "agents_chain_onchain_idx" ON "agents" USING btree ("chain_id","onchain_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_deployer_idx" ON "agents" USING btree ("deployer");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "escrows_chain_onchain_idx" ON "escrows" USING btree ("chain_id","onchain_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "escrows_buyer_idx" ON "escrows" USING btree ("buyer");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "escrows_state_idx" ON "escrows" USING btree ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_chain_block_idx" ON "events" USING btree ("chain_id","block_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "events_unique_idx" ON "events" USING btree ("chain_id","tx_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reputations_agent_idx" ON "reputations" USING btree ("agent_pk");