CREATE TABLE "coffee_bags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"roaster_name" text NOT NULL,
	"style" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"date_roasted" timestamp,
	"date_opened" timestamp,
	"picture" text,
	"user_id" text NOT NULL,
	"device_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coffee_brews" (
	"id" text PRIMARY KEY NOT NULL,
	"coffee_bag_id" text NOT NULL,
	"grind_setting" real NOT NULL,
	"dry_weight" real NOT NULL,
	"brew_time" real NOT NULL,
	"pressure_reading" real NOT NULL,
	"notes" text,
	"picture" text,
	"user_id" text NOT NULL,
	"device_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_id" text NOT NULL,
	"operation" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"status" text NOT NULL,
	"details" text
);
--> statement-breakpoint
CREATE INDEX "coffee_bags_user_id_idx" ON "coffee_bags" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coffee_bags_updated_at_idx" ON "coffee_bags" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "coffee_bags_user_updated_idx" ON "coffee_bags" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "coffee_brews_user_id_idx" ON "coffee_brews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coffee_brews_bag_id_idx" ON "coffee_brews" USING btree ("coffee_bag_id");--> statement-breakpoint
CREATE INDEX "coffee_brews_updated_at_idx" ON "coffee_brews" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "coffee_brews_user_updated_idx" ON "coffee_brews" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "sync_log_user_id_idx" ON "sync_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sync_log_timestamp_idx" ON "sync_log" USING btree ("timestamp");