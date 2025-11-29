import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Users table for authentication
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	admin: boolean('admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Sessions table for Lucia
export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Demo users table for sandboxed auth demos
export const demoUsers = pgTable('demo_users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	admin: boolean('admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Demo sessions table for sandboxed auth demos
export const demoSessions = pgTable('demo_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => demoUsers.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Blog posts table
export const posts = pgTable('posts', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	excerpt: text('excerpt'),
	content: text('content').notNull(),
	coverImage: text('cover_image'),
	published: boolean('published').notNull().default(false),
	authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	publishedAt: timestamp('published_at', { withTimezone: true })
});

// Demo blog posts table for sandboxed blog demos (no auth required)
export const demoPosts = pgTable('demo_posts', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	excerpt: text('excerpt'),
	content: text('content').notNull(),
	coverImage: text('cover_image'),
	published: boolean('published').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	publishedAt: timestamp('published_at', { withTimezone: true })
});

// ============================================================================
// STORE TABLES (Demo - no auth required)
// ============================================================================

// Product categories
export const demoCategories = pgTable('demo_categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	image: text('image'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Products
export const demoProducts = pgTable('demo_products', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	price: text('price').notNull(), // Store as text to avoid floating point issues, parse as cents
	compareAtPrice: text('compare_at_price'), // Original price for sales
	image: text('image'),
	images: text('images'), // JSON array of additional images
	categoryId: text('category_id').references(() => demoCategories.id, { onDelete: 'set null' }),
	inventory: text('inventory').notNull().default('0'),
	published: boolean('published').notNull().default(true),
	featured: boolean('featured').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Shopping cart items (session-based for demo)
export const demoCartItems = pgTable('demo_cart_items', {
	id: text('id').primaryKey(),
	sessionId: text('session_id').notNull(), // Browser session identifier
	productId: text('product_id')
		.notNull()
		.references(() => demoProducts.id, { onDelete: 'cascade' }),
	quantity: text('quantity').notNull().default('1'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Orders
export const demoOrders = pgTable('demo_orders', {
	id: text('id').primaryKey(),
	sessionId: text('session_id').notNull(),
	email: text('email').notNull(),
	status: text('status').notNull().default('pending'), // pending, processing, shipped, delivered, cancelled
	subtotal: text('subtotal').notNull(),
	tax: text('tax').notNull().default('0'),
	shipping: text('shipping').notNull().default('0'),
	total: text('total').notNull(),
	shippingAddress: text('shipping_address'), // JSON string
	billingAddress: text('billing_address'), // JSON string
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Order line items
export const demoOrderItems = pgTable('demo_order_items', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => demoOrders.id, { onDelete: 'cascade' }),
	productId: text('product_id').references(() => demoProducts.id, { onDelete: 'set null' }),
	productName: text('product_name').notNull(), // Snapshot of product name at purchase time
	productImage: text('product_image'),
	price: text('price').notNull(), // Price at time of purchase
	quantity: text('quantity').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type DemoUser = typeof demoUsers.$inferSelect;
export type DemoSession = typeof demoSessions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type DemoPost = typeof demoPosts.$inferSelect;
export type NewDemoPost = typeof demoPosts.$inferInsert;

// Store types
export type DemoCategory = typeof demoCategories.$inferSelect;
export type NewDemoCategory = typeof demoCategories.$inferInsert;
export type DemoProduct = typeof demoProducts.$inferSelect;
export type NewDemoProduct = typeof demoProducts.$inferInsert;
export type DemoCartItem = typeof demoCartItems.$inferSelect;
export type NewDemoCartItem = typeof demoCartItems.$inferInsert;
export type DemoOrder = typeof demoOrders.$inferSelect;
export type NewDemoOrder = typeof demoOrders.$inferInsert;
export type DemoOrderItem = typeof demoOrderItems.$inferSelect;
export type NewDemoOrderItem = typeof demoOrderItems.$inferInsert;

// ============================================================================
// TRACKER TABLES (Demo - no auth required)
// ============================================================================

// Tracker categories (Exercise, Diet, Sleep, Mood, Custom, etc.)
export const demoTrackerCategories = pgTable('demo_tracker_categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	icon: text('icon'), // Emoji or icon name
	color: text('color'), // Hex color for UI
	sortOrder: text('sort_order').notNull().default('0'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker metrics (e.g., Steps, Calories, Hours of Sleep, Weight, etc.)
export const demoTrackerMetrics = pgTable('demo_tracker_metrics', {
	id: text('id').primaryKey(),
	categoryId: text('category_id')
		.notNull()
		.references(() => demoTrackerCategories.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	unit: text('unit'), // e.g., "steps", "calories", "hours", "kg", "lbs"
	valueType: text('value_type').notNull().default('number'), // number, duration, boolean, text, rating
	icon: text('icon'),
	color: text('color'),
	defaultValue: text('default_value'),
	minValue: text('min_value'),
	maxValue: text('max_value'),
	sortOrder: text('sort_order').notNull().default('0'),
	archived: boolean('archived').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker entries (the actual logged data)
export const demoTrackerEntries = pgTable('demo_tracker_entries', {
	id: text('id').primaryKey(),
	metricId: text('metric_id')
		.notNull()
		.references(() => demoTrackerMetrics.id, { onDelete: 'cascade' }),
	value: text('value').notNull(), // Stored as text, parsed based on valueType
	notes: text('notes'),
	date: timestamp('date', { withTimezone: true }).notNull(), // The date this entry is for
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker goals (optional targets for metrics)
export const demoTrackerGoals = pgTable('demo_tracker_goals', {
	id: text('id').primaryKey(),
	metricId: text('metric_id')
		.notNull()
		.references(() => demoTrackerMetrics.id, { onDelete: 'cascade' }),
	targetValue: text('target_value').notNull(),
	targetType: text('target_type').notNull().default('daily'), // daily, weekly, monthly
	comparison: text('comparison').notNull().default('gte'), // gte (>=), lte (<=), eq (=)
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker types
export type DemoTrackerCategory = typeof demoTrackerCategories.$inferSelect;
export type NewDemoTrackerCategory = typeof demoTrackerCategories.$inferInsert;
export type DemoTrackerMetric = typeof demoTrackerMetrics.$inferSelect;
export type NewDemoTrackerMetric = typeof demoTrackerMetrics.$inferInsert;
export type DemoTrackerEntry = typeof demoTrackerEntries.$inferSelect;
export type NewDemoTrackerEntry = typeof demoTrackerEntries.$inferInsert;
export type DemoTrackerGoal = typeof demoTrackerGoals.$inferSelect;
export type NewDemoTrackerGoal = typeof demoTrackerGoals.$inferInsert;
