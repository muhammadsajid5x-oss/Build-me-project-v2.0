ALTER TABLE "testimonials" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "helpful_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "story_url" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;