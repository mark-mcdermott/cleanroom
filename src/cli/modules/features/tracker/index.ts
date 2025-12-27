import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

function getTrackerSchema(): string {
	return `
// Tracker categories
export const trackerCategories = pgTable('tracker_categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	icon: text('icon'),
	color: text('color'),
	sortOrder: text('sort_order').notNull().default('0'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker metrics
export const trackerMetrics = pgTable('tracker_metrics', {
	id: text('id').primaryKey(),
	categoryId: text('category_id')
		.notNull()
		.references(() => trackerCategories.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	unit: text('unit'),
	valueType: text('value_type').notNull().default('number'),
	icon: text('icon'),
	color: text('color'),
	sortOrder: text('sort_order').notNull().default('0'),
	archived: boolean('archived').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker entries
export const trackerEntries = pgTable('tracker_entries', {
	id: text('id').primaryKey(),
	metricId: text('metric_id')
		.notNull()
		.references(() => trackerMetrics.id, { onDelete: 'cascade' }),
	value: text('value').notNull(),
	notes: text('notes'),
	date: timestamp('date', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker goals
export const trackerGoals = pgTable('tracker_goals', {
	id: text('id').primaryKey(),
	metricId: text('metric_id')
		.notNull()
		.references(() => trackerMetrics.id, { onDelete: 'cascade' }),
	targetValue: text('target_value').notNull(),
	targetType: text('target_type').notNull().default('daily'),
	comparison: text('comparison').notNull().default('gte'),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker types
export type TrackerCategory = typeof trackerCategories.$inferSelect;
export type TrackerMetric = typeof trackerMetrics.$inferSelect;
export type TrackerEntry = typeof trackerEntries.$inferSelect;
export type TrackerGoal = typeof trackerGoals.$inferSelect;
`;
}

function getTrackerHomepageSvelte(): string {
	return `<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Calendar, TrendingUp, Target, Plus, BarChart3, ListChecks, Goal } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Tracker - Track What Matters</title>
	<meta name="description" content="Track your habits, metrics, and goals. Build better routines with simple, powerful tracking." />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">
	<!-- Hero Section -->
	<div class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">Track what matters</h1>
		<p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
			Build better habits and reach your goals with simple, powerful tracking.
			See your progress at a glance.
		</p>
		<div class="flex gap-3 justify-center">
			<Button.Root href="/signup" class="cursor-pointer">Get Started</Button.Root>
			<Button.Root href="/login" variant="outline" class="cursor-pointer">Sign In</Button.Root>
		</div>
	</div>

	<!-- Device Mockup Section -->
	<div class="mb-20">
		<div class="relative mx-auto max-w-3xl">
			<!-- Browser Frame -->
			<div class="rounded-xl border border-border bg-muted/30 shadow-2xl overflow-hidden">
				<!-- Browser Top Bar -->
				<div class="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
					<div class="flex gap-1.5">
						<div class="w-3 h-3 rounded-full bg-red-400"></div>
						<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
						<div class="w-3 h-3 rounded-full bg-green-400"></div>
					</div>
					<div class="flex-1 mx-4">
						<div class="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
							tracker.app/dashboard
						</div>
					</div>
					<div class="w-16"></div>
				</div>

				<!-- Dashboard Preview Content -->
				<div class="bg-background p-6">
					<!-- Dashboard Header -->
					<div class="flex items-center justify-between mb-6">
						<div>
							<h2 class="text-xl font-semibold">Dashboard</h2>
							<p class="text-sm text-muted-foreground">Wed, Dec 11 - Track your progress</p>
						</div>
						<div class="flex gap-2">
							<div class="px-3 py-1.5 text-xs border border-border rounded-md bg-background">Settings</div>
							<div class="px-3 py-1.5 text-xs bg-foreground text-background rounded-md flex items-center gap-1">
								<Plus class="w-3 h-3" /> Log Entry
							</div>
						</div>
					</div>

					<!-- Stats Grid -->
					<div class="grid grid-cols-4 gap-3 mb-6">
						<div class="bg-background border border-border rounded-lg p-3">
							<Calendar class="w-4 h-4 text-blue-600 mb-1" />
							<p class="text-lg font-bold">5</p>
							<p class="text-xs text-muted-foreground">today</p>
						</div>
						<div class="bg-background border border-border rounded-lg p-3">
							<TrendingUp class="w-4 h-4 text-green-600 mb-1" />
							<p class="text-lg font-bold">23</p>
							<p class="text-xs text-muted-foreground">this week</p>
						</div>
						<div class="bg-background border border-border rounded-lg p-3">
							<Target class="w-4 h-4 text-purple-600 mb-1" />
							<p class="text-lg font-bold">4</p>
							<p class="text-xs text-muted-foreground">tracked</p>
						</div>
						<div class="bg-background border border-border rounded-lg p-3">
							<Target class="w-4 h-4 text-amber-600 mb-1" />
							<p class="text-lg font-bold">3</p>
							<p class="text-xs text-muted-foreground">goals</p>
						</div>
					</div>

					<!-- Sample Entries Preview -->
					<div class="border border-border rounded-lg p-4">
						<div class="flex items-center justify-between py-2 border-b border-border">
							<span class="text-sm">Water intake</span>
							<span class="text-sm font-medium">8 glasses</span>
						</div>
						<div class="flex items-center justify-between py-2 border-b border-border">
							<span class="text-sm">Exercise</span>
							<span class="text-sm font-medium">45 min</span>
						</div>
						<div class="flex items-center justify-between py-2">
							<span class="text-sm">Reading</span>
							<span class="text-sm font-medium">30 pages</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Decorative gradient behind -->
			<div class="absolute -inset-4 -z-10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 rounded-2xl blur-2xl"></div>
		</div>
	</div>

	<!-- How It Works Section -->
	<div class="mb-16">
		<h2 class="text-2xl font-semibold text-center mb-10">How it works</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
					<ListChecks class="w-6 h-6 text-blue-600" />
				</div>
				<h3 class="font-semibold mb-2">1. Create metrics</h3>
				<p class="text-sm text-muted-foreground">
					Set up the things you want to track. Water intake, exercise, reading, sleep - anything.
				</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
					<BarChart3 class="w-6 h-6 text-green-600" />
				</div>
				<h3 class="font-semibold mb-2">2. Log daily</h3>
				<p class="text-sm text-muted-foreground">
					Quick and easy logging. Just enter your numbers and you're done.
				</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
					<Goal class="w-6 h-6 text-purple-600" />
				</div>
				<h3 class="font-semibold mb-2">3. See progress</h3>
				<p class="text-sm text-muted-foreground">
					Watch your streaks grow and goals get hit. Stay motivated with visual progress.
				</p>
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="text-center py-12 border-t border-border">
		<h2 class="text-2xl font-semibold mb-4">Ready to start tracking?</h2>
		<p class="text-muted-foreground mb-6">Free to use. No credit card required.</p>
		<Button.Root href="/signup" class="cursor-pointer">Create your account</Button.Root>
	</div>
</div>
`;
}

function getTrackerDashboardSvelte(): string {
	return `<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { Plus, TrendingUp, Target, Calendar, Settings } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	const metricsTracked = $derived(new Set(data.todayEntries.map((e: { metricId: string }) => e.metricId)).size);
</script>

<svelte:head>
	<title>Dashboard - Tracker</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground mt-1">{formatDate(new Date())} - Track your progress</p>
		</div>
		<div class="flex gap-2">
			<Button.Root variant="outline" onclick={() => goto('/dashboard/admin')} class="cursor-pointer">
				<Settings class="w-4 h-4 mr-2" />
				Settings
			</Button.Root>
			<Button.Root onclick={() => goto('/dashboard/log')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				Log Entry
			</Button.Root>
		</div>
	</div>

	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-background border border-border rounded-lg p-4">
			<Calendar class="w-5 h-5 text-blue-600 mb-2" />
			<p class="text-2xl font-bold">{data.todayEntries.length}</p>
			<p class="text-sm text-muted-foreground">today</p>
		</div>
		<div class="bg-background border border-border rounded-lg p-4">
			<TrendingUp class="w-5 h-5 text-green-600 mb-2" />
			<p class="text-2xl font-bold">{data.recentEntries.length}</p>
			<p class="text-sm text-muted-foreground">this week</p>
		</div>
		<div class="bg-background border border-border rounded-lg p-4">
			<Target class="w-5 h-5 text-purple-600 mb-2" />
			<p class="text-2xl font-bold">{metricsTracked}</p>
			<p class="text-sm text-muted-foreground">tracked</p>
		</div>
		<div class="bg-background border border-border rounded-lg p-4">
			<Target class="w-5 h-5 text-amber-600 mb-2" />
			<p class="text-2xl font-bold">{data.goals.length}</p>
			<p class="text-sm text-muted-foreground">goals</p>
		</div>
	</div>

	{#if data.categories.length === 0}
		<div class="border border-dashed border-border rounded-lg p-8 text-center">
			<p class="text-muted-foreground mb-4">Set up categories and metrics to start tracking.</p>
			<Button.Root variant="outline" onclick={() => goto('/dashboard/admin')} class="cursor-pointer">
				Set Up Tracker
			</Button.Root>
		</div>
	{/if}
</div>
`;
}

function getTrackerDashboardServer(): string {
	return `import { redirect } from '@sveltejs/kit';
import { createDb, trackerCategories, trackerMetrics, trackerEntries, trackerGoals } from '$lib/server/db';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// Require authentication
	if (!locals.user) {
		redirect(302, '/login');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { categories: [], todayEntries: [], recentEntries: [], metrics: [], goals: [] };
	}

	const db = createDb(databaseUrl);

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const weekAgo = new Date(today);
	weekAgo.setDate(weekAgo.getDate() - 7);

	const categories = await db.select().from(trackerCategories).orderBy(trackerCategories.sortOrder);
	const metrics = await db.select().from(trackerMetrics).where(eq(trackerMetrics.archived, false));

	const todayEntries = await db
		.select({
			id: trackerEntries.id,
			metricId: trackerEntries.metricId,
			value: trackerEntries.value,
			date: trackerEntries.date
		})
		.from(trackerEntries)
		.where(and(gte(trackerEntries.date, today), lte(trackerEntries.date, tomorrow)));

	const recentEntries = await db
		.select({
			id: trackerEntries.id,
			metricId: trackerEntries.metricId,
			value: trackerEntries.value,
			date: trackerEntries.date
		})
		.from(trackerEntries)
		.where(gte(trackerEntries.date, weekAgo))
		.orderBy(desc(trackerEntries.date))
		.limit(20);

	const goals = await db.select().from(trackerGoals).where(eq(trackerGoals.active, true));

	return { categories, metrics, todayEntries, recentEntries, goals };
};
`;
}

export const trackerModule: FeatureModule = {
	name: 'tracker',
	async apply(config: ProjectConfig, outputDir: string) {
		console.log('  → Adding tracker module for activity/habit tracking');

		// Create dashboard route
		await mkdir(join(outputDir, 'src', 'routes', 'dashboard'), { recursive: true });

		// Replace homepage with tracker homepage
		await writeFile(join(outputDir, 'src', 'routes', '+page.svelte'), getTrackerHomepageSvelte());

		// Dashboard at /dashboard (auth protected)
		await writeFile(join(outputDir, 'src', 'routes', 'dashboard', '+page.svelte'), getTrackerDashboardSvelte());
		await writeFile(join(outputDir, 'src', 'routes', 'dashboard', '+page.server.ts'), getTrackerDashboardServer());

		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		try {
			let schema = await readFile(schemaPath, 'utf-8');
			if (!schema.includes('trackerCategories')) {
				// Ensure boolean is imported (tracker schema uses it)
				if (!schema.includes('boolean') && schema.includes("from 'drizzle-orm/pg-core'")) {
					schema = schema.replace(
						/import \{ ([^}]+) \} from 'drizzle-orm\/pg-core'/,
						"import { $1, boolean } from 'drizzle-orm/pg-core'"
					);
				}
				schema += '\n' + getTrackerSchema();
				await writeFile(schemaPath, schema);
			}
		} catch {
			// Schema doesn't exist
		}

		const packageJsonPath = join(outputDir, 'package.json');
		try {
			const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
			packageJson.dependencies = { ...packageJson.dependencies, 'lucide-svelte': '^0.468.0' };
			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {}

		console.log('  → Tracker module created successfully');
	}
};
