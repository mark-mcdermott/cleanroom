<script lang="ts">
	import { goto } from '$app/navigation';
	import { StatCard, MetricCard, EntryCard, Button, ProgressRing } from '$lib/components/ui';
	import { Plus, TrendingUp, Target, Calendar, ArrowRight } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	function formatTime(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	function getGoalForMetric(metricId: string) {
		return data.goals.find((g) => g.metricId === metricId);
	}

	function getTodayValueForMetric(metricId: string): number {
		const entries = data.todayEntries.filter((e) => e.metricId === metricId);
		return entries.reduce((sum, e) => sum + parseFloat(e.value), 0);
	}

	function getGoalProgress(metricId: string): number {
		const goal = getGoalForMetric(metricId);
		if (!goal) return 0;
		const todayValue = getTodayValueForMetric(metricId);
		return Math.min(100, Math.round((todayValue / parseFloat(goal.targetValue)) * 100));
	}

	// Group metrics by category
	const metricsByCategory = $derived(() => {
		const grouped: Record<string, typeof data.metrics> = {};
		for (const metric of data.metrics) {
			const catId = metric.categoryId || 'uncategorized';
			if (!grouped[catId]) grouped[catId] = [];
			grouped[catId].push(metric);
		}
		return grouped;
	});

	// Get category name by id
	function getCategoryName(categoryId: string): string {
		const cat = data.categories.find((c) => c.id === categoryId);
		return cat?.name || 'Other';
	}

	function getCategoryIcon(categoryId: string): string {
		const cat = data.categories.find((c) => c.id === categoryId);
		return cat?.icon || '📊';
	}

	// Calculate stats
	const totalEntriesThisWeek = data.recentEntries.length;
	const metricsTracked = new Set(data.todayEntries.map((e) => e.metricId)).size;
	const goalsWithProgress = data.goals.filter((g) => getGoalProgress(g.metricId) > 0).length;
</script>

<svelte:head>
	<title>Dashboard - Tracker</title>
	<meta name="description" content="Track your daily activities and habits" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
			<p class="text-zinc-500 mt-1">
				{formatDate(new Date())} - Track your progress
			</p>
		</div>
		<Button.Root onclick={() => goto('/modules/tracker/log')} class="cursor-pointer">
			<Plus class="w-4 h-4 mr-2" />
			Log Entry
		</Button.Root>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<StatCard.Root>
			<StatCard.Icon color="#3b82f6">
				<Calendar class="w-5 h-5" />
			</StatCard.Icon>
			<StatCard.Label>Today's Entries</StatCard.Label>
			<StatCard.Value>{data.todayEntries.length}</StatCard.Value>
		</StatCard.Root>

		<StatCard.Root>
			<StatCard.Icon color="#10b981">
				<TrendingUp class="w-5 h-5" />
			</StatCard.Icon>
			<StatCard.Label>This Week</StatCard.Label>
			<StatCard.Value>{totalEntriesThisWeek}</StatCard.Value>
		</StatCard.Root>

		<StatCard.Root>
			<StatCard.Icon color="#8b5cf6">
				<Target class="w-5 h-5" />
			</StatCard.Icon>
			<StatCard.Label>Metrics Tracked</StatCard.Label>
			<StatCard.Value>{metricsTracked}</StatCard.Value>
		</StatCard.Root>

		<StatCard.Root>
			<StatCard.Icon color="#f59e0b">
				<Target class="w-5 h-5" />
			</StatCard.Icon>
			<StatCard.Label>Goals In Progress</StatCard.Label>
			<StatCard.Value>{goalsWithProgress}</StatCard.Value>
		</StatCard.Root>
	</div>

	<!-- Today's Metrics with Goals -->
	{#if data.goals.length > 0}
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold">Today's Goals</h2>
				<a href="/modules/tracker/metrics" class="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1">
					View all metrics <ArrowRight class="w-4 h-4" />
				</a>
			</div>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.goals as goal}
					{@const metric = data.metrics.find((m) => m.id === goal.metricId)}
					{#if metric}
						{@const todayValue = getTodayValueForMetric(goal.metricId)}
						{@const progress = getGoalProgress(goal.metricId)}
						<MetricCard.Root class="cursor-pointer" onclick={() => goto(`/modules/tracker/metrics/${metric.id}`)}>
							<MetricCard.Header>
								<div>
									<MetricCard.Title>{metric.name}</MetricCard.Title>
									<p class="text-sm text-zinc-500 mt-0.5">Daily Goal</p>
								</div>
								<ProgressRing.Root value={progress} size={56} strokeWidth={6} color={metric.color || '#3b82f6'}>
									<span class="text-xs font-semibold">{progress}%</span>
								</ProgressRing.Root>
							</MetricCard.Header>
							<MetricCard.Value value={todayValue} unit={metric.unit || ''} color={metric.color || undefined} />
							<MetricCard.Progress value={todayValue} goal={parseFloat(goal.targetValue)} color={metric.color || '#3b82f6'} />
						</MetricCard.Root>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Recent Entries -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold">Recent Entries</h2>
			<a href="/modules/tracker/history" class="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1">
				View all <ArrowRight class="w-4 h-4" />
			</a>
		</div>

		{#if data.todayEntries.length === 0 && data.recentEntries.length === 0}
			<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
				<p class="text-zinc-600 mb-4">
					No entries yet. Start tracking by logging your first entry!
				</p>
				<Button.Root onclick={() => goto('/modules/tracker/log')} class="cursor-pointer">
					<Plus class="w-4 h-4 mr-2" />
					Log Your First Entry
				</Button.Root>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.recentEntries.slice(0, 8) as entry}
					<EntryCard.Root>
						<EntryCard.Icon emoji={entry.metricIcon || '📊'} color={entry.metricColor || '#3b82f6'} />
						<EntryCard.Content>
							<EntryCard.Title>{entry.metricName}</EntryCard.Title>
							<EntryCard.Meta>
								{formatDate(entry.date)} at {formatTime(entry.date)}
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

	<!-- Quick Access by Category -->
	{#if data.categories.length > 0}
		<div>
			<h2 class="text-xl font-semibold mb-4">Categories</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each data.categories as category}
					<button
						onclick={() => goto(`/modules/tracker/log?category=${category.slug}`)}
						class="p-4 bg-white rounded-xl border border-border hover:border-zinc-300 transition-colors text-left cursor-pointer"
					>
						<span class="text-2xl">{category.icon || '📊'}</span>
						<h3 class="font-medium mt-2">{category.name}</h3>
						<p class="text-sm text-zinc-500 mt-0.5">
							{data.metrics.filter((m) => m.categoryId === category.id).length} metrics
						</p>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.categories.length === 0}
		<div class="border border-dashed border-zinc-300 rounded-lg p-8 text-center">
			<p class="text-zinc-600 mb-4">
				No categories or metrics set up yet. Go to the admin panel to get started.
			</p>
			<Button.Root variant="outline" onclick={() => goto('/modules/tracker/admin')} class="cursor-pointer">
				Set Up Tracker
			</Button.Root>
		</div>
	{/if}
</div>
