ALTER TABLE "ownership_audits"
  ADD COLUMN "full_name" text,
  ADD COLUMN "q1" text,
  ADD COLUMN "q2" text,
  ADD COLUMN "q3" text,
  ADD COLUMN "q4" text,
  ADD COLUMN "q5" text,
  ADD COLUMN "q6" text,
  ADD COLUMN "q7" text,
  ADD COLUMN "q8" text,
  ADD COLUMN "q9" text,
  ADD COLUMN "q10" text,
  ADD COLUMN "diagnostic_result" text,
  ADD COLUMN "redirect_target" text;
--> statement-breakpoint
UPDATE "ownership_audits"
SET
  "full_name" = 'Legacy audit',
  "q1" = "step1",
  "q2" = "step2",
  "q3" = "step3",
  "q4" = "step3",
  "q5" = "step3",
  "q6" = "step3",
  "q7" = "step3",
  "q8" = "step3",
  "q9" = "step3",
  "q10" = "step3",
  "diagnostic_result" = CASE
    WHEN "score" <= 6 THEN 'High technical debt, unmanaged assets, critical execution gaps.'
    WHEN "score" <= 11 THEN 'Functional foundation, but lacks automated governance and structure.'
    ELSE 'Highly mature, automated, and secure architecture.'
  END,
  "redirect_target" = CASE
    WHEN "score" <= 6 THEN 'Deliver My Project'
    WHEN "score" <= 11 THEN 'Mentor Me'
    ELSE 'Coffee With Me'
  END;
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
