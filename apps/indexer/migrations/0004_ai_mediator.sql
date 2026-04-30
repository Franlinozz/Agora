CREATE TABLE IF NOT EXISTS "mediation_logs" (
	"pk" serial PRIMARY KEY NOT NULL,
	"escrow_pk" integer NOT NULL,
	"queue_pk" integer,
	"event_type" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mediation_queue" ADD COLUMN "result_payload" jsonb;--> statement-breakpoint
ALTER TABLE "mediation_queue" ADD COLUMN "worker_id" text;--> statement-breakpoint
ALTER TABLE "mediation_queue" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mediation_logs" ADD CONSTRAINT "mediation_logs_escrow_pk_escrows_pk_fk" FOREIGN KEY ("escrow_pk") REFERENCES "public"."escrows"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mediation_logs" ADD CONSTRAINT "mediation_logs_queue_pk_mediation_queue_pk_fk" FOREIGN KEY ("queue_pk") REFERENCES "public"."mediation_queue"("pk") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mediation_logs_escrow_idx" ON "mediation_logs" USING btree ("escrow_pk");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mediation_logs_queue_idx" ON "mediation_logs" USING btree ("queue_pk");