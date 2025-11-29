import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Helper to determine if site uses SSR (database) or SSG
function isSSRSite(config: ProjectConfig): boolean {
	return config.siteType === 'ssr-site';
}

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

function getTrackerSchema(): string {
	return `// Tracker categories
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

// Tracker metrics (things to track)
export const trackerMetrics = pgTable('tracker_metrics', {
	id: text('id').primaryKey(),
	categoryId: text('category_id')
		.notNull()
		.references(() => trackerCategories.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	unit: text('unit'),
	valueType: text('value_type').notNull().default('number'),
	icon: text('icon'),
	color: text('color'),
	description: text('description'),
	defaultValue: text('default_value'),
	minValue: text('min_value'),
	maxValue: text('max_value'),
	archived: boolean('archived').notNull().default(false),
	sortOrder: text('sort_order').notNull().default('0'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Tracker entries (logged values)
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

// Tracker type exports
export type TrackerCategory = typeof trackerCategories.$inferSelect;
export type NewTrackerCategory = typeof trackerCategories.$inferInsert;
export type TrackerMetric = typeof trackerMetrics.$inferSelect;
export type NewTrackerMetric = typeof trackerMetrics.$inferInsert;
export type TrackerEntry = typeof trackerEntries.$inferSelect;
export type NewTrackerEntry = typeof trackerEntries.$inferInsert;
export type TrackerGoal = typeof trackerGoals.$inferSelect;
export type NewTrackerGoal = typeof trackerGoals.$inferInsert;
`;
}

// ============================================================================
// SERVER LOAD FUNCTIONS
// ============================================================================

function getTrackerDashboardServer(): string {
	return `import { createDb, trackerCategories, trackerMetrics, trackerEntries, trackerGoals } from '$lib/server/db';
import { desc, eq, and, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { categories: [], metrics: [], entries: [], goals: [], stats: {} };
	}

	const db = createDb(databaseUrl);

	const categories = await db
		.select()
		.from(trackerCategories)
		.orderBy(trackerCategories.sortOrder);

	const metrics = await db
		.select()
		.from(trackerMetrics)
		.where(eq(trackerMetrics.archived, false))
		.orderBy(trackerMetrics.sortOrder);

	// Get today's entries
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const entries = await db
		.select({
			id: trackerEntries.id,
			metricId: trackerEntries.metricId,
			value: trackerEntries.value,
			notes: trackerEntries.notes,
			date: trackerEntries.date,
			metricName: trackerMetrics.name,
			metricUnit: trackerMetrics.unit,
			metricIcon: trackerMetrics.icon,
			metricColor: trackerMetrics.color
		})
		.from(trackerEntries)
		.leftJoin(trackerMetrics, eq(trackerEntries.metricId, trackerMetrics.id))
		.where(gte(trackerEntries.date, today))
		.orderBy(desc(trackerEntries.date))
		.limit(20);

	const goals = await db
		.select({
			id: trackerGoals.id,
			metricId: trackerGoals.metricId,
			targetValue: trackerGoals.targetValue,
			targetType: trackerGoals.targetType,
			comparison: trackerGoals.comparison,
			metricName: trackerMetrics.name,
			metricUnit: trackerMetrics.unit,
			metricIcon: trackerMetrics.icon,
			metricColor: trackerMetrics.color
		})
		.from(trackerGoals)
		.leftJoin(trackerMetrics, eq(trackerGoals.metricId, trackerMetrics.id))
		.where(eq(trackerGoals.active, true));

	// Calculate goal progress
	const goalsWithProgress = await Promise.all(
		goals.map(async (goal) => {
			const todayEntries = entries.filter((e) => e.metricId === goal.metricId);
			const currentValue = todayEntries.reduce((sum, e) => sum + parseFloat(e.value || '0'), 0);
			const target = parseFloat(goal.targetValue);
			const progress = target > 0 ? (currentValue / target) * 100 : 0;
			return { ...goal, currentValue, progress: Math.min(progress, 100) };
		})
	);

	return { categories, metrics, entries, goals: goalsWithProgress };
};
`;
}

function getLogEntryServer(): string {
	return `import { fail, redirect } from '@sveltejs/kit';
import { createDb, trackerCategories, trackerMetrics, trackerEntries } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	const metricParam = url.searchParams.get('metric');
	const categoryParam = url.searchParams.get('category');

	if (!databaseUrl) {
		return { categories: [], metrics: [], selectedMetric: metricParam, selectedCategory: categoryParam };
	}

	const db = createDb(databaseUrl);

	const categories = await db
		.select()
		.from(trackerCategories)
		.orderBy(trackerCategories.sortOrder);

	const metrics = await db
		.select()
		.from(trackerMetrics)
		.where(eq(trackerMetrics.archived, false))
		.orderBy(trackerMetrics.sortOrder);

	return { categories, metrics, selectedMetric: metricParam, selectedCategory: categoryParam };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const metricId = formData.get('metricId') as string;
		const value = formData.get('value') as string;
		const notes = formData.get('notes') as string;
		const dateStr = formData.get('date') as string;

		if (!metricId || !value) {
			return fail(400, { error: 'Metric and value are required' });
		}

		const db = createDb(databaseUrl);

		try {
			const date = dateStr ? new Date(dateStr) : new Date();
			const id = crypto.randomUUID();

			await db.insert(trackerEntries).values({
				id,
				metricId,
				value,
				notes: notes || null,
				date
			});

			throw redirect(303, '/tracker');
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Failed to log entry:', e);
			return fail(500, { error: 'Failed to log entry' });
		}
	}
};
`;
}

// ============================================================================
// SVELTE COMPONENTS
// ============================================================================

function getTrackerDashboardSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, StatCard, EntryCard, ProgressRing } from '$lib/components/ui';
	import { Plus, History, Settings, Target } from 'lucide-svelte';

	let { data } = $props();

	function formatTime(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	// Group entries by category
	const entriesByCategory = $derived(() => {
		const grouped: Record<string, typeof data.entries> = {};
		for (const entry of data.entries) {
			const metric = data.metrics.find((m) => m.id === entry.metricId);
			if (metric) {
				const categoryId = metric.categoryId;
				if (!grouped[categoryId]) grouped[categoryId] = [];
				grouped[categoryId].push(entry);
			}
		}
		return grouped;
	});
</script>

<svelte:head>
	<title>Tracker - ${config.projectName}</title>
	<meta name="description" content="Track your daily activities and metrics" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Tracker</h1>
			<p class="text-zinc-500 mt-1">Track your daily activities</p>
		</div>
		<div class="flex items-center gap-2">
			<Button.Root variant="outline" onclick={() => goto('/tracker/history')} class="cursor-pointer">
				<History class="w-4 h-4 mr-2" />
				History
			</Button.Root>
			<Button.Root onclick={() => goto('/tracker/log')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				Log Entry
			</Button.Root>
		</div>
	</div>

	<!-- Goals Section -->
	{#if data.goals.length > 0}
		<div class="mb-8">
			<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
				<Target class="w-5 h-5 text-zinc-400" />
				Today's Goals
			</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each data.goals as goal}
					<div class="bg-white rounded-xl border border-border p-4">
						<div class="flex items-center justify-between mb-2">
							<span class="text-2xl">{goal.metricIcon || '📊'}</span>
							<ProgressRing.Root
								progress={goal.progress}
								size={40}
								strokeWidth={4}
								color={goal.metricColor || '#3b82f6'}
							>
								<span class="text-xs font-bold">{Math.round(goal.progress)}%</span>
							</ProgressRing.Root>
						</div>
						<p class="font-medium text-sm">{goal.metricName}</p>
						<p class="text-xs text-zinc-500">
							{goal.currentValue.toLocaleString()} / {parseFloat(goal.targetValue).toLocaleString()}
							{goal.metricUnit || ''}
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Quick Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<StatCard.Root>
			<StatCard.Label>Categories</StatCard.Label>
			<StatCard.Value>{data.categories.length}</StatCard.Value>
		</StatCard.Root>
		<StatCard.Root>
			<StatCard.Label>Active Metrics</StatCard.Label>
			<StatCard.Value>{data.metrics.length}</StatCard.Value>
		</StatCard.Root>
		<StatCard.Root>
			<StatCard.Label>Today's Entries</StatCard.Label>
			<StatCard.Value>{data.entries.length}</StatCard.Value>
		</StatCard.Root>
		<StatCard.Root>
			<StatCard.Label>Active Goals</StatCard.Label>
			<StatCard.Value>{data.goals.length}</StatCard.Value>
		</StatCard.Root>
	</div>

	<!-- Today's Entries -->
	<div>
		<h2 class="text-xl font-semibold mb-4">Today's Entries</h2>
		{#if data.entries.length === 0}
			<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
				<p class="text-zinc-600 mb-4">No entries logged today yet.</p>
				<Button.Root onclick={() => goto('/tracker/log')} class="cursor-pointer">
					<Plus class="w-4 h-4 mr-2" />
					Log Your First Entry
				</Button.Root>
			</div>
		{:else}
			<div class="space-y-2">
				{#each data.entries as entry}
					<EntryCard.Root>
						<EntryCard.Icon emoji={entry.metricIcon || '📊'} color={entry.metricColor || '#3b82f6'} />
						<EntryCard.Content>
							<EntryCard.Title>{entry.metricName}</EntryCard.Title>
							<EntryCard.Meta>
								{formatTime(entry.date)}
								{#if entry.notes}
									<span class="text-zinc-400 mx-1">•</span>
									<span class="truncate">{entry.notes}</span>
								{/if}
							</EntryCard.Meta>
						</EntryCard.Content>
						<EntryCard.Value>
							<span class="text-xl font-bold" style="color: {entry.metricColor || '#18181b'}">
								{entry.value}
							</span>
							{#if entry.metricUnit}
								<span class="text-zinc-500 text-sm ml-1">{entry.metricUnit}</span>
							{/if}
						</EntryCard.Value>
					</EntryCard.Root>
				{/each}
			</div>
		{/if}
	</div>
</div>
`;
}

function getLogEntrySvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea, Select } from '$lib/components/ui';
	import { ArrowLeft, Loader2, Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let isSubmitting = $state(false);
	let selectedCategoryId = $state<string | null>(null);
	let selectedMetricId = $state<string | null>(data.selectedMetric);

	const filteredMetrics = $derived(() => {
		if (!selectedCategoryId) return data.metrics;
		return data.metrics.filter((m) => m.categoryId === selectedCategoryId);
	});

	const selectedMetric = $derived(() => {
		if (!selectedMetricId) return null;
		return data.metrics.find((m) => m.id === selectedMetricId);
	});
</script>

<svelte:head>
	<title>Log Entry - ${config.projectName}</title>
	<meta name="description" content="Log a new tracker entry" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-8">
	<a href="/tracker" class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8">
		<ArrowLeft class="w-4 h-4" />
		Back to dashboard
	</a>

	<h1 class="text-3xl font-semibold tracking-tight mb-2">Log Entry</h1>
	<p class="text-zinc-500 mb-8">Record your progress for any metric</p>

	{#if data.metrics.length === 0}
		<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
			<p class="text-zinc-600 mb-4">No metrics set up yet. Create metrics in the admin panel first.</p>
			<Button.Root variant="outline" onclick={() => goto('/tracker/admin')} class="cursor-pointer">
				Set Up Metrics
			</Button.Root>
		</div>
	{:else}
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'redirect') {
						toast.success('Entry logged successfully!');
						goto(result.location);
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to log entry');
					}
				};
			}}
			class="space-y-6"
		>
			<!-- Category Filter -->
			<div>
				<Label.Root for="category">Category (optional filter)</Label.Root>
				<Select.Root
					value={selectedCategoryId || undefined}
					onValueChange={(v) => {
						selectedCategoryId = v || null;
						selectedMetricId = null;
					}}
				>
					<Select.Trigger class="w-full mt-1.5">
						<Select.Value placeholder="All categories" />
					</Select.Trigger>
					<Select.Content>
						{#each data.categories as category}
							<Select.Item value={category.id}>
								{category.icon} {category.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Metric Selection -->
			<div>
				<Label.Root for="metricId">Metric *</Label.Root>
				<Select.Root
					name="metricId"
					value={selectedMetricId || undefined}
					onValueChange={(v) => (selectedMetricId = v || null)}
					required
				>
					<Select.Trigger class="w-full mt-1.5">
						<Select.Value placeholder="Select a metric to log" />
					</Select.Trigger>
					<Select.Content>
						{#each filteredMetrics() as metric}
							<Select.Item value={metric.id}>
								{metric.icon || '📊'} {metric.name}
								{#if metric.unit}
									<span class="text-zinc-400">({metric.unit})</span>
								{/if}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Value Input -->
			<div>
				<Label.Root for="value">Value *</Label.Root>
				{#if selectedMetric()?.valueType === 'rating'}
					<div class="flex gap-2 mt-2">
						{#each [1, 2, 3, 4, 5] as rating}
							<label class="cursor-pointer">
								<input type="radio" name="value" value={rating} class="sr-only peer" />
								<span class="w-10 h-10 rounded-lg border-2 border-zinc-200 flex items-center justify-center text-lg peer-checked:border-amber-400 peer-checked:bg-amber-50 hover:border-zinc-300 transition-colors">
									{rating}
								</span>
							</label>
						{/each}
					</div>
				{:else}
					<div class="relative mt-1.5">
						<Input.Root type="number" id="value" name="value" placeholder="0" step="any" required />
						{#if selectedMetric()?.unit}
							<span class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
								{selectedMetric()?.unit}
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Date -->
			<div>
				<Label.Root for="date">Date</Label.Root>
				<Input.Root
					type="datetime-local"
					id="date"
					name="date"
					value={new Date().toISOString().slice(0, 16)}
					class="mt-1.5"
				/>
			</div>

			<!-- Notes -->
			<div>
				<Label.Root for="notes">Notes (optional)</Label.Root>
				<Textarea.Root id="notes" name="notes" placeholder="Any additional notes..." rows={3} class="mt-1.5" />
			</div>

			<!-- Submit -->
			<div class="flex items-center gap-4 pt-4">
				<Button.Root type="submit" class="cursor-pointer" disabled={isSubmitting || !selectedMetricId}>
					{#if isSubmitting}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						Logging...
					{:else}
						<Check class="w-4 h-4 mr-2" />
						Log Entry
					{/if}
				</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto('/tracker')} class="cursor-pointer">
					Cancel
				</Button.Root>
			</div>
		</form>
	{/if}
</div>
`;
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function getStatCardComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	data-slot="stat-card"
	class={cn('bg-white rounded-xl border border-border p-4', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
`;
}

function getStatCardLabelComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<p
	data-slot="stat-card-label"
	class={cn('text-sm text-zinc-500 flex items-center gap-1.5', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</p>
`;
}

function getStatCardValueComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<p
	data-slot="stat-card-value"
	class={cn('text-2xl font-bold text-foreground mt-1', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</p>
`;
}

function getStatCardIndex(): string {
	return `import Root from './StatCard.svelte';
import Label from './StatCardLabel.svelte';
import Value from './StatCardValue.svelte';

export {
	Root,
	Label,
	Value,
	Root as StatCard,
	Label as StatCardLabel,
	Value as StatCardValue
};
`;
}

function getEntryCardComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	data-slot="entry-card"
	class={cn('flex items-center gap-4 p-4 bg-white rounded-lg border border-border', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
`;
}

function getEntryCardIconComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		emoji?: string;
		color?: string;
	}

	let { class: className, emoji = '📊', color = '#3b82f6', ...restProps }: Props = $props();
</script>

<div
	data-slot="entry-card-icon"
	class={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0', className)}
	style="background-color: {color}20"
	{...restProps}
>
	{emoji}
</div>
`;
}

function getEntryCardContentComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	data-slot="entry-card-content"
	class={cn('flex-1 min-w-0', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
`;
}

function getEntryCardTitleComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<p
	data-slot="entry-card-title"
	class={cn('font-medium text-foreground', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</p>
`;
}

function getEntryCardMetaComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<p
	data-slot="entry-card-meta"
	class={cn('text-sm text-zinc-500 truncate', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</p>
`;
}

function getEntryCardValueComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	data-slot="entry-card-value"
	class={cn('text-right flex-shrink-0', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
`;
}

function getEntryCardIndex(): string {
	return `import Root from './EntryCard.svelte';
import Icon from './EntryCardIcon.svelte';
import Content from './EntryCardContent.svelte';
import Title from './EntryCardTitle.svelte';
import Meta from './EntryCardMeta.svelte';
import Value from './EntryCardValue.svelte';

export {
	Root,
	Icon,
	Content,
	Title,
	Meta,
	Value,
	Root as EntryCard,
	Icon as EntryCardIcon,
	Content as EntryCardContent,
	Title as EntryCardTitle,
	Meta as EntryCardMeta,
	Value as EntryCardValue
};
`;
}

function getProgressRingComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<SVGSVGElement> {
		class?: string;
		progress?: number;
		size?: number;
		strokeWidth?: number;
		color?: string;
		children?: Snippet;
	}

	let {
		class: className,
		progress = 0,
		size = 64,
		strokeWidth = 6,
		color = '#3b82f6',
		children,
		...restProps
	}: Props = $props();

	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (progress / 100) * circumference;
</script>

<div class="relative inline-flex items-center justify-center" style="width: {size}px; height: {size}px">
	<svg
		data-slot="progress-ring"
		class={cn('transform -rotate-90', className)}
		width={size}
		height={size}
		{...restProps}
	>
		<!-- Background circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke="currentColor"
			stroke-width={strokeWidth}
			class="text-zinc-200"
		/>
		<!-- Progress circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			class="transition-all duration-300 ease-out"
		/>
	</svg>
	{#if children}
		<div class="absolute inset-0 flex items-center justify-center">
			{@render children()}
		</div>
	{/if}
</div>
`;
}

function getProgressRingIndex(): string {
	return `import Root from './ProgressRing.svelte';

export {
	Root,
	Root as ProgressRing
};
`;
}

// ============================================================================
// SEED SCRIPT
// ============================================================================

function getTrackerSeedScript(): string {
	return `import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { trackerCategories, trackerMetrics, trackerGoals, trackerEntries } from './src/lib/server/db/schema';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const categories = [
	{ id: 'cat-exercise', name: 'Exercise', slug: 'exercise', description: 'Track your physical activity', icon: '🏃', color: '#10b981', sortOrder: '1' },
	{ id: 'cat-diet', name: 'Diet', slug: 'diet', description: 'Monitor your nutrition', icon: '🥗', color: '#f59e0b', sortOrder: '2' },
	{ id: 'cat-sleep', name: 'Sleep', slug: 'sleep', description: 'Track your sleep patterns', icon: '😴', color: '#8b5cf6', sortOrder: '3' },
	{ id: 'cat-mood', name: 'Mood', slug: 'mood', description: 'Monitor your emotional wellbeing', icon: '😊', color: '#ec4899', sortOrder: '4' },
	{ id: 'cat-health', name: 'Health', slug: 'health', description: 'Track health metrics', icon: '❤️', color: '#ef4444', sortOrder: '5' }
];

const metrics = [
	{ id: 'metric-steps', categoryId: 'cat-exercise', name: 'Steps', slug: 'steps', unit: 'steps', valueType: 'number', icon: '👟', color: '#10b981', sortOrder: '1' },
	{ id: 'metric-workout', categoryId: 'cat-exercise', name: 'Workout Duration', slug: 'workout-duration', unit: 'min', valueType: 'number', icon: '💪', color: '#10b981', sortOrder: '2' },
	{ id: 'metric-water', categoryId: 'cat-diet', name: 'Water', slug: 'water', unit: 'glasses', valueType: 'number', icon: '💧', color: '#3b82f6', sortOrder: '1' },
	{ id: 'metric-sleep-hours', categoryId: 'cat-sleep', name: 'Hours of Sleep', slug: 'sleep-hours', unit: 'hrs', valueType: 'number', icon: '🛏️', color: '#8b5cf6', sortOrder: '1' },
	{ id: 'metric-mood', categoryId: 'cat-mood', name: 'Mood', slug: 'mood', unit: '/5', valueType: 'rating', icon: '😊', color: '#ec4899', sortOrder: '1' },
	{ id: 'metric-weight', categoryId: 'cat-health', name: 'Weight', slug: 'weight', unit: 'lbs', valueType: 'number', icon: '⚖️', color: '#ef4444', sortOrder: '1' }
];

const goals = [
	{ id: 'goal-steps', metricId: 'metric-steps', targetValue: '10000', targetType: 'daily', comparison: 'gte' },
	{ id: 'goal-water', metricId: 'metric-water', targetValue: '8', targetType: 'daily', comparison: 'gte' },
	{ id: 'goal-sleep', metricId: 'metric-sleep-hours', targetValue: '8', targetType: 'daily', comparison: 'gte' }
];

async function seed() {
	console.log('Seeding tracker data...');

	for (const cat of categories) {
		await db.insert(trackerCategories).values(cat).onConflictDoNothing();
		console.log(\`Created category: \${cat.name}\`);
	}

	for (const metric of metrics) {
		await db.insert(trackerMetrics).values(metric).onConflictDoNothing();
		console.log(\`Created metric: \${metric.name}\`);
	}

	for (const goal of goals) {
		await db.insert(trackerGoals).values(goal).onConflictDoNothing();
		console.log(\`Created goal for: \${goal.metricId}\`);
	}

	console.log('Done!');
}

seed().catch(console.error);
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const trackerModule: FeatureModule = {
	name: 'tracker',
	async apply(config: ProjectConfig, outputDir: string) {
		const useDatabase = isSSRSite(config);

		if (!useDatabase) {
			console.log('  → Tracker module requires SSR site type with database support');
			console.log('  → Skipping tracker module for static sites');
			return;
		}

		console.log('  → Generating habit/activity tracker module');

		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes', 'tracker', 'log'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'tracker', 'history'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'tracker', 'admin'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'lib', 'components', 'ui', 'stat-card'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'lib', 'components', 'ui', 'progress-ring'), { recursive: true });
		await mkdir(join(outputDir, 'scripts'), { recursive: true });

		// Check if db schema already exists
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		let existingSchema = '';
		try {
			existingSchema = await readFile(schemaPath, 'utf-8');
		} catch {
			await mkdir(join(outputDir, 'src', 'lib', 'server', 'db'), { recursive: true });
		}

		// Append tracker schema
		if (existingSchema) {
			let updatedSchema = existingSchema;
			if (!existingSchema.includes('boolean')) {
				updatedSchema = existingSchema.replace(
					"import { pgTable, text, timestamp }",
					"import { pgTable, text, timestamp, boolean }"
				);
			}
			await writeFile(schemaPath, updatedSchema + '\n' + getTrackerSchema());
		} else {
			const baseSchema = `import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

${getTrackerSchema()}`;
			await writeFile(schemaPath, baseSchema);
		}

		// Write tracker routes
		await writeFile(join(outputDir, 'src', 'routes', 'tracker', '+page.server.ts'), getTrackerDashboardServer());
		await writeFile(join(outputDir, 'src', 'routes', 'tracker', '+page.svelte'), getTrackerDashboardSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', 'tracker', 'log', '+page.server.ts'), getLogEntryServer());
		await writeFile(join(outputDir, 'src', 'routes', 'tracker', 'log', '+page.svelte'), getLogEntrySvelte(config));

		// Write StatCard components
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'stat-card', 'StatCard.svelte'), getStatCardComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'stat-card', 'StatCardLabel.svelte'), getStatCardLabelComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'stat-card', 'StatCardValue.svelte'), getStatCardValueComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'stat-card', 'index.ts'), getStatCardIndex());

		// Write EntryCard components
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'EntryCard.svelte'), getEntryCardComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'EntryCardIcon.svelte'), getEntryCardIconComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'EntryCardContent.svelte'), getEntryCardContentComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'EntryCardTitle.svelte'), getEntryCardTitleComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'EntryCardMeta.svelte'), getEntryCardMetaComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'EntryCardValue.svelte'), getEntryCardValueComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'entry-card', 'index.ts'), getEntryCardIndex());

		// Write ProgressRing components
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'progress-ring', 'ProgressRing.svelte'), getProgressRingComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'progress-ring', 'index.ts'), getProgressRingIndex());

		// Write seed script
		await writeFile(join(outputDir, 'scripts', 'seed-tracker.ts'), getTrackerSeedScript());

		// Update package.json
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		packageJson.dependencies = {
			...packageJson.dependencies,
			'drizzle-orm': '^0.38.3',
			'@neondatabase/serverless': '^0.10.4'
		};

		packageJson.devDependencies = {
			...packageJson.devDependencies,
			'drizzle-kit': '^0.30.1',
			'dotenv': '^16.4.7'
		};

		packageJson.scripts = {
			...packageJson.scripts,
			'db:generate': 'drizzle-kit generate',
			'db:push': 'drizzle-kit push',
			'db:studio': 'drizzle-kit studio',
			'db:seed-tracker': 'npx tsx scripts/seed-tracker.ts'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));

		console.log('  → Tracker module created successfully');
		console.log('  → Run "pnpm db:push" to create tables');
		console.log('  → Run "pnpm db:seed-tracker" to add sample data');
	}
};
