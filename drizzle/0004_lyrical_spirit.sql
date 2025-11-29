CREATE TABLE "demo_galleries" (
	"id" text PRIMARY KEY NOT NULL,
	"widget_id" text NOT NULL,
	"name" text DEFAULT 'Gallery' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"widget_id" text,
	"thingy_id" text,
	"gallery_id" text,
	"content" text NOT NULL,
	"sort_order" text DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"widget_id" text,
	"thingy_id" text,
	"gallery_id" text,
	"url" text NOT NULL,
	"caption" text,
	"filename" text,
	"mime_type" text,
	"sort_order" text DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_thingys" (
	"id" text PRIMARY KEY NOT NULL,
	"widget_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"custom_fields" text,
	"sort_order" text DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_widgets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"custom_fields" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_galleries" ADD CONSTRAINT "demo_galleries_widget_id_demo_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."demo_widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_notes" ADD CONSTRAINT "demo_notes_widget_id_demo_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."demo_widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_notes" ADD CONSTRAINT "demo_notes_thingy_id_demo_thingys_id_fk" FOREIGN KEY ("thingy_id") REFERENCES "public"."demo_thingys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_notes" ADD CONSTRAINT "demo_notes_gallery_id_demo_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."demo_galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_photos" ADD CONSTRAINT "demo_photos_widget_id_demo_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."demo_widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_photos" ADD CONSTRAINT "demo_photos_thingy_id_demo_thingys_id_fk" FOREIGN KEY ("thingy_id") REFERENCES "public"."demo_thingys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_photos" ADD CONSTRAINT "demo_photos_gallery_id_demo_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."demo_galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_thingys" ADD CONSTRAINT "demo_thingys_widget_id_demo_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."demo_widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_widgets" ADD CONSTRAINT "demo_widgets_user_id_demo_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."demo_users"("id") ON DELETE cascade ON UPDATE no action;