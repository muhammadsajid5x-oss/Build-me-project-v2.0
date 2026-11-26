ALTER TABLE "testimonials" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "communications" integer;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "timelines" integer;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "knowledge" integer;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "value" integer;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "outcome" text;--> statement-breakpoint
ALTER TABLE "case_studies" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "case_studies" ADD COLUMN "key_results" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "source" text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "communications" integer;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "timelines" integer;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "knowledge" integer;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "value" integer;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "outcome" text;