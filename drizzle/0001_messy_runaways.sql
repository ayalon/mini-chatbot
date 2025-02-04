CREATE TABLE "chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text,
	"crawl_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" json,
	"language" text,
	"title" text,
	"tokens" integer,
	"position" integer,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "crawl" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text,
	"markdown" text,
	"url" text,
	"source_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" json,
	"language" text,
	"title" text,
	"summary" text,
	"comment" text,
	"og_date" timestamp with time zone,
	CONSTRAINT "crawl_url_unique" UNIQUE("url")
);
