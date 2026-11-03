ALTER TABLE "ownership_audits"
  ADD COLUMN IF NOT EXISTS "full_name" text,
  ADD COLUMN IF NOT EXISTS "q1" text,
  ADD COLUMN IF NOT EXISTS "q2" text,
  ADD COLUMN IF NOT EXISTS "q3" text,
  ADD COLUMN IF NOT EXISTS "q4" text,
  ADD COLUMN IF NOT EXISTS "q5" text,
  ADD COLUMN IF NOT EXISTS "q6" text,
  ADD COLUMN IF NOT EXISTS "q7" text,
  ADD COLUMN IF NOT EXISTS "q8" text,
  ADD COLUMN IF NOT EXISTS "q9" text,
  ADD COLUMN IF NOT EXISTS "q10" text,
  ADD COLUMN IF NOT EXISTS "diagnostic_result" text,
  ADD COLUMN IF NOT EXISTS "redirect_target" text;
--> statement-breakpoint
UPDATE "ownership_audits"
SET
  "full_name" = COALESCE("full_name", 'Legacy audit'),
  "q1" = COALESCE("q1", "step1"),
  "q2" = COALESCE("q2", "step2"),
  "q3" = COALESCE("q3", "step3"),
  "q4" = COALESCE("q4", "step3"),
  "q5" = COALESCE("q5", "step3"),
  "q6" = COALESCE("q6", "step3"),
  "q7" = COALESCE("q7", "step3"),
  "q8" = COALESCE("q8", "step3"),
  "q9" = COALESCE("q9", "step3"),
  "q10" = COALESCE("q10", "step3"),
  "diagnostic_result" = COALESCE(
    "diagnostic_result",
    CASE
      WHEN "score" <= 35 THEN 'High technical debt, unmanaged assets, critical execution gaps.'
      WHEN "score" <= 69 THEN 'Functional foundation, but lacks automated governance and structure.'
      ELSE 'Highly mature, automated, and secure architecture.'
    END
  ),
  "redirect_target" = COALESCE(
    "redirect_target",
    CASE
      WHEN "score" <= 35 THEN 'Deliver My Project'
      WHEN "score" <= 69 THEN 'Mentor Me'
      ELSE 'Coffee With Me'
    END
  );
--> statement-breakpoint
ALTER TABLE "ownership_audits"
  ALTER COLUMN "full_name" SET NOT NULL,
  ALTER COLUMN "q1" SET NOT NULL,
  ALTER COLUMN "q2" SET NOT NULL,
  ALTER COLUMN "q3" SET NOT NULL,
  ALTER COLUMN "q4" SET NOT NULL,
  ALTER COLUMN "q5" SET NOT NULL,
  ALTER COLUMN "q6" SET NOT NULL,
  ALTER COLUMN "q7" SET NOT NULL,
  ALTER COLUMN "q8" SET NOT NULL,
  ALTER COLUMN "q9" SET NOT NULL,
  ALTER COLUMN "q10" SET NOT NULL,
  ALTER COLUMN "diagnostic_result" SET NOT NULL,
  ALTER COLUMN "redirect_target" SET NOT NULL;

--> statement-breakpoint
ALTER TABLE "ownership_audits"
  ALTER COLUMN "step1" DROP NOT NULL,
  ALTER COLUMN "step2" DROP NOT NULL,
  ALTER COLUMN "step3" DROP NOT NULL;
