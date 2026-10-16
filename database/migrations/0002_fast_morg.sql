CREATE TYPE "public"."analytics_event_type" AS ENUM('view', 'click');--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "event_type" "analytics_event_type" DEFAULT 'click' NOT NULL;