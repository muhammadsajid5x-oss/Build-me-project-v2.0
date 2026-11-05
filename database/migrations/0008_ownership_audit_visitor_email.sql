UPDATE "ownership_audits"
SET "visitor_email" = 'legacy-audit-' || "id"::text || '@example.invalid'
WHERE "visitor_email" IS NULL;
--> statement-breakpoint
ALTER TABLE "ownership_audits"
  ALTER COLUMN "visitor_email" SET NOT NULL;
