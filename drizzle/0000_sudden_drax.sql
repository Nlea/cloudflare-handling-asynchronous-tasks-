DO $$ BEGIN
 CREATE TYPE "public"."distance" AS ENUM('10', 'half', 'full');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runners" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"address" text,
	"distance" "distance",
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "runners_email_unique" UNIQUE("email")
);
