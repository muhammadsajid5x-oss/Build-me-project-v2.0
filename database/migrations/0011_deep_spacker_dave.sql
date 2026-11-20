CREATE TABLE "case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"category" text,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"outcome" text NOT NULL,
	"content" text NOT NULL,
	"image" text,
	"story_url" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
