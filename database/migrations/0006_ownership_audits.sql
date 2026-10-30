CREATE TABLE "ownership_audits" (
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
ALTER TABLE "ownership_audits"
ADD CONSTRAINT "ownership_audits_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL;