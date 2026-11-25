CREATE TYPE "public"."feedback_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "status" "feedback_status" DEFAULT 'pending' NOT NULL;