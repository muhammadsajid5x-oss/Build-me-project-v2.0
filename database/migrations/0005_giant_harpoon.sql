CREATE TABLE IF NOT EXISTS "ownership_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"visitor_email" text,
	"step1" text NOT NULL,
	"step2" text NOT NULL,
	"step3" text NOT NULL,
	"score" integer NOT NULL,
	"category" text NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ownership_audits_user_id_users_id_fk'
      AND conrelid = 'public.ownership_audits'::regclass
  ) THEN
    ALTER TABLE "ownership_audits"
      ADD CONSTRAINT "ownership_audits_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "topic" text;