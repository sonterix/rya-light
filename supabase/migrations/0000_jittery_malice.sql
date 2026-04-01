CREATE TABLE "audience_genre_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience_id" uuid NOT NULL,
	"genre_slug" text NOT NULL,
	"avg_interest" numeric NOT NULL,
	"pct_highly_interested" numeric NOT NULL,
	"respondent_count" integer NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"filters" jsonb,
	"manual_includes" integer[],
	"manual_excludes" integer[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_outputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"audience_id" uuid NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"genre_slug" text PRIMARY KEY NOT NULL,
	"genre_name" text NOT NULL,
	"genre_categories" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respondent_genre_interests" (
	"respondent_id" integer NOT NULL,
	"genre_slug" text NOT NULL,
	"interest_level" smallint NOT NULL,
	CONSTRAINT "respondent_genre_interests_respondent_id_genre_slug_pk" PRIMARY KEY("respondent_id","genre_slug")
);
--> statement-breakpoint
CREATE TABLE "respondents" (
	"respondent_id" integer PRIMARY KEY NOT NULL,
	"wave" integer NOT NULL,
	"wave_id" integer NOT NULL,
	"weight" numeric NOT NULL,
	"audience_category" text NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"ethnicity" text NOT NULL,
	"region" text NOT NULL,
	"community_type" text NOT NULL,
	"marital_status" text NOT NULL,
	"household_size" integer NOT NULL,
	"education" text NOT NULL,
	"employment_status" text NOT NULL,
	"household_income_usd" integer NOT NULL,
	"investable_assets_usd" integer NOT NULL,
	"zip_code" text NOT NULL,
	"state" text NOT NULL,
	"dma" text NOT NULL,
	"parent_status" text NOT NULL,
	"political_affiliation" text NOT NULL,
	"home_ownership" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audience_genre_summaries" ADD CONSTRAINT "audience_genre_summaries_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audience_genre_summaries" ADD CONSTRAINT "audience_genre_summaries_genre_slug_genres_genre_slug_fk" FOREIGN KEY ("genre_slug") REFERENCES "public"."genres"("genre_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_outputs" ADD CONSTRAINT "creative_outputs_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respondent_genre_interests" ADD CONSTRAINT "respondent_genre_interests_respondent_id_respondents_respondent_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."respondents"("respondent_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respondent_genre_interests" ADD CONSTRAINT "respondent_genre_interests_genre_slug_genres_genre_slug_fk" FOREIGN KEY ("genre_slug") REFERENCES "public"."genres"("genre_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ags_audience_avg_interest_idx" ON "audience_genre_summaries" USING btree ("audience_id","avg_interest");--> statement-breakpoint
CREATE INDEX "ags_audience_id_idx" ON "audience_genre_summaries" USING btree ("audience_id");--> statement-breakpoint
CREATE INDEX "audiences_user_id_idx" ON "audiences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audiences_user_id_updated_at_idx" ON "audiences" USING btree ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "creative_outputs_user_id_idx" ON "creative_outputs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creative_outputs_audience_type_idx" ON "creative_outputs" USING btree ("audience_id","type");--> statement-breakpoint
CREATE INDEX "creative_outputs_user_type_updated_idx" ON "creative_outputs" USING btree ("user_id","type","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "rgi_genre_interest_idx" ON "respondent_genre_interests" USING btree ("genre_slug","interest_level");--> statement-breakpoint
CREATE INDEX "rgi_respondent_id_idx" ON "respondent_genre_interests" USING btree ("respondent_id");--> statement-breakpoint
CREATE INDEX "rgi_genre_slug_idx" ON "respondent_genre_interests" USING btree ("genre_slug");--> statement-breakpoint
CREATE INDEX "respondents_audience_category_idx" ON "respondents" USING btree ("audience_category");--> statement-breakpoint
CREATE INDEX "respondents_age_idx" ON "respondents" USING btree ("age");--> statement-breakpoint
CREATE INDEX "respondents_gender_idx" ON "respondents" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "respondents_region_idx" ON "respondents" USING btree ("region");--> statement-breakpoint
CREATE INDEX "respondents_state_idx" ON "respondents" USING btree ("state");--> statement-breakpoint
CREATE INDEX "respondents_community_type_idx" ON "respondents" USING btree ("community_type");--> statement-breakpoint
CREATE INDEX "respondents_household_income_usd_idx" ON "respondents" USING btree ("household_income_usd");--> statement-breakpoint
CREATE INDEX "respondents_parent_status_idx" ON "respondents" USING btree ("parent_status");--> statement-breakpoint
CREATE INDEX "respondents_education_idx" ON "respondents" USING btree ("education");--> statement-breakpoint
CREATE INDEX "respondents_employment_status_idx" ON "respondents" USING btree ("employment_status");--> statement-breakpoint
CREATE INDEX "respondents_home_ownership_idx" ON "respondents" USING btree ("home_ownership");