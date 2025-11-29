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

	const metricsTracked = new Set(data.todayEntries.map((e) => e.metricId)).size;
</script>

<svelte:head>
	<title>Dashboard - Tracker</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
			<p class="text-zinc-500 dark:text-zinc-400 mt-1">{formatDate(new Date())} - Track your progress</p>
		</div>
		<div class="flex gap-2">
			<Button.Root variant="outline" onclick={() => goto('/tracker/admin')} class="cursor-pointer">
				<Settings class="w-4 h-4 mr-2" />
				Settings
			</Button.Root>
			<Button.Root onclick={() => goto('/tracker/log')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				Log Entry
			</Button.Root>
		</div>
	</div>

	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<Calendar class="w-5 h-5 text-blue-600 mb-2" />
			<p class="text-2xl font-bold">{data.todayEntries.length}</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">today</p>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<TrendingUp class="w-5 h-5 text-green-600 mb-2" />
			<p class="text-2xl font-bold">{data.recentEntries.length}</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">this week</p>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<Target class="w-5 h-5 text-purple-600 mb-2" />
			<p class="text-2xl font-bold">{metricsTracked}</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">tracked</p>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<Target class="w-5 h-5 text-amber-600 mb-2" />
			<p class="text-2xl font-bold">{data.goals.length}</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">goals</p>
		</div>
	</div>

	{#if data.categories.length === 0}
		<div class="border border-dashed border-zinc-300 rounded-lg p-8 text-center">
			<p class="text-zinc-600 dark:text-zinc-400 mb-4">Set up categories and metrics to start tracking.</p>
			<Button.Root variant="outline" onclick={() => goto('/tracker/admin')} class="cursor-pointer">
				Set Up Tracker
			</Button.Root>
		</div>
	{/if}
</div>
`;
}

function getTrackerDashboardServer(): string {
	return `import { createDb, trackerCategories, trackerMetrics, trackerEntries, trackerGoals } from '$lib/server/db';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
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

		await mkdir(join(outputDir, 'src', 'routes', 'tracker'), { recursive: true });

		await writeFile(join(outputDir, 'src', 'routes', 'tracker', '+page.svelte'), getTrackerDashboardSvelte());
		await writeFile(join(outputDir, 'src', 'routes', 'tracker', '+page.server.ts'), getTrackerDashboardServer());

		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		try {
			let schema = await readFile(schemaPath, 'utf-8');
			if (!schema.includes('trackerCategories')) {
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
