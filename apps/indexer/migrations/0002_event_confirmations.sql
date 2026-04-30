ALTER TABLE "events" ADD COLUMN "confirmations" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "confirmed" boolean DEFAULT true NOT NULL;