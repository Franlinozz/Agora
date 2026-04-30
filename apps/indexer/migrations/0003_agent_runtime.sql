CREATE TABLE IF NOT EXISTS "agent_credentials" (
	"pk" serial PRIMARY KEY NOT NULL,
	"agent_pk" integer NOT NULL,
	"provider" text NOT NULL,
	"encrypted_api_key" text NOT NULL,
	"encrypted_endpoint_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_tasks" (
	"pk" serial PRIMARY KEY NOT NULL,
	"agent_pk" integer NOT NULL,
	"escrow_pk" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"input_payload" jsonb NOT NULL,
	"output_payload" jsonb,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"worker_id" text,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mediation_queue" (
	"pk" serial PRIMARY KEY NOT NULL,
	"escrow_pk" integer NOT NULL,
	"delivery_payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_credentials" ADD CONSTRAINT "agent_credentials_agent_pk_agents_pk_fk" FOREIGN KEY ("agent_pk") REFERENCES "public"."agents"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agent_pk_agents_pk_fk" FOREIGN KEY ("agent_pk") REFERENCES "public"."agents"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_escrow_pk_escrows_pk_fk" FOREIGN KEY ("escrow_pk") REFERENCES "public"."escrows"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mediation_queue" ADD CONSTRAINT "mediation_queue_escrow_pk_escrows_pk_fk" FOREIGN KEY ("escrow_pk") REFERENCES "public"."escrows"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "agent_credentials_agent_idx" ON "agent_credentials" USING btree ("agent_pk");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_tasks_status_idx" ON "agent_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_tasks_agent_idx" ON "agent_tasks" USING btree ("agent_pk");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_tasks_escrow_idx" ON "agent_tasks" USING btree ("escrow_pk");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mediation_queue_status_idx" ON "mediation_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mediation_queue_escrow_idx" ON "mediation_queue" USING btree ("escrow_pk");