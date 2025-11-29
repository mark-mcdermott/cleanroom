CREATE TABLE "demo_cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" text DEFAULT '1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "demo_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"product_name" text NOT NULL,
	"product_image" text,
	"price" text NOT NULL,
	"quantity" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotal" text NOT NULL,
	"tax" text DEFAULT '0' NOT NULL,
	"shipping" text DEFAULT '0' NOT NULL,
	"total" text NOT NULL,
	"shipping_address" text,
	"billing_address" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"compare_at_price" text,
	"image" text,
	"images" text,
	"category_id" text,
	"inventory" text DEFAULT '0' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "demo_tracker_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"sort_order" text DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_tracker_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "demo_tracker_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"metric_id" text NOT NULL,
	"value" text NOT NULL,
	"notes" text,
	"date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_tracker_goals" (
	"id" text PRIMARY KEY NOT NULL,
	"metric_id" text NOT NULL,
	"target_value" text NOT NULL,
	"target_type" text DEFAULT 'daily' NOT NULL,
	"comparison" text DEFAULT 'gte' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_tracker_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"unit" text,
	"value_type" text DEFAULT 'number' NOT NULL,
	"icon" text,
	"color" text,
	"default_value" text,
	"min_value" text,
	"max_value" text,
	"sort_order" text DEFAULT '0' NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "demo_cart_items" ADD CONSTRAINT "demo_cart_items_product_id_demo_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."demo_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_order_items" ADD CONSTRAINT "demo_order_items_order_id_demo_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."demo_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_order_items" ADD CONSTRAINT "demo_order_items_product_id_demo_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."demo_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_products" ADD CONSTRAINT "demo_products_category_id_demo_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."demo_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_tracker_entries" ADD CONSTRAINT "demo_tracker_entries_metric_id_demo_tracker_metrics_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."demo_tracker_metrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_tracker_goals" ADD CONSTRAINT "demo_tracker_goals_metric_id_demo_tracker_metrics_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."demo_tracker_metrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_tracker_metrics" ADD CONSTRAINT "demo_tracker_metrics_category_id_demo_tracker_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."demo_tracker_categories"("id") ON DELETE cascade ON UPDATE no action;