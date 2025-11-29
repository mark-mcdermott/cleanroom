<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, StatCard, EntryCard, ProgressRing } from '$lib/components/ui';
	import { ArrowLeft, Plus, TrendingUp, Target, Calendar, BarChart3 } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	// Group entries by date for display
	function groupEntriesByDate(entries: typeof data.entries) {
		const grouped: Record<string, typeof data.entries> = {};
		for (const entry of entries) {
			const dateKey = new Date(entry.date).toDateString();
			if (!grouped[dateKey]) grouped[dateKey] = [];
			grouped[dateKey].push(entry);
		}
		return grouped;
	}

	const entriesByDate = $derived(groupEntriesByDate(data.entries));
	const dateKeys = $derived(
		Object.keys(entriesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
	);
</script>

<svelte:head>
	<title>{data.metric.name} - Tracker</title>
	<meta name="description" content="View details for {data.metric.name}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<a
		href="/modules/tracker"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to dashboard
	</a>

	<!-- Header -->
	<div class="flex items-start justify-between mb-8">
		<div class="flex items-center gap-4">
			<div
				class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
				style="background-color: {data.metric.color}20"
			>
				{data.metric.icon || '📊'}
			</div>
			<div>
				<h1 class="text-3xl font-semibold tracking-tight">{data.metric.name}</h1>
				<p class="text-zinc-500 mt-1">
					{data.metric.categoryIcon} {data.metric.categoryName}
					{#if data.metric.unit}
						<span class="mx-2">•</span>
						<span>{data.metric.unit}</span>
					{/if}
				</p>
			</div>
		</div>
		<Button.Root onclick={() => goto(`/modules/tracker/log?metric=${data.metric.id}`)} class="cursor-pointer">
			<Plus class="w-4 h-4 mr-2" />
			Log Entry
		</Button.Root>
	</div>

	{#if data.metric.description}
		<p class="text-zinc-600 mb-8">{data.metric.description}</p>
	{/if}

	<!-- Goal Progress (if goal exists) -->
	{#if data.goal}
		<div class="bg-white rounded-xl border border-border p-6 mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold flex items-center gap-2">
						<Target class="w-5 h-5 text-zinc-400" />
						Daily Goal
					</h2>
					<p class="text-zinc-500 mt-1">
						{data.todayTotal.toLocaleString()} / {parseFloat(data.goal.targetValue).toLocaleString()}
						{data.metric.unit || ''}
					</p>
				</div>
				<ProgressRing.Root
					value={Math.min(data.goalProgress || 0, 100)}
					size={80}
					strokeWidth={8}
					color={data.metric.color || '#3b82f6'}
				>
					<span class="text-lg font-bold">{Math.round(data.goalProgress || 0)}%</span>
				</ProgressRing.Root>
			</div>
		</div>
	{/if}

	<!-- Statistics -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<StatCard.Root>
			<StatCard.Label>
				<BarChart3 class="w-4 h-4" />
				Total Entries
			</StatCard.Label>
			<StatCard.Value>{data.stats.total}</StatCard.Value>
		</StatCard.Root>

		{#if data.stats.average !== null}
			<StatCard.Root>
				<StatCard.Label>
					<TrendingUp class="w-4 h-4" />
					Average
				</StatCard.Label>
				<StatCard.Value>
					{data.stats.average}
					{#if data.metric.unit}
						<span class="text-sm font-normal text-zinc-500">{data.metric.unit}</span>
					{/if}
				</StatCard.Value>
			</StatCard.Root>

			<StatCard.Root>
				<StatCard.Label>Min</StatCard.Label>
				<StatCard.Value>
					{data.stats.min}
					{#if data.metric.unit}
						<span class="text-sm font-normal text-zinc-500">{data.metric.unit}</span>
					{/if}
				</StatCard.Value>
			</StatCard.Root>

			<StatCard.Root>
				<StatCard.Label>Max</StatCard.Label>
				<StatCard.Value>
					{data.stats.max}
					{#if data.metric.unit}
						<span class="text-sm font-normal text-zinc-500">{data.metric.unit}</span>
					{/if}
				</StatCard.Value>
			</StatCard.Root>
		{/if}
	</div>

	<!-- Recent Entries -->
	<div>
		<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
			<Calendar class="w-5 h-5 text-zinc-400" />
			Recent Entries (Last 30 Days)
		</h2>

		{#if data.entries.length === 0}
			<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
				<p class="text-zinc-600 mb-4">No entries yet for this metric.</p>
				<Button.Root
					variant="outline"
					onclick={() => goto(`/modules/tracker/log?metric=${data.metric.id}`)}
					class="cursor-pointer"
				>
					<Plus class="w-4 h-4 mr-2" />
					Log Your First Entry
				</Button.Root>
			</div>
		{:else}
			<div class="space-y-6">
				{#each dateKeys as dateKey}
					<div>
						<h3 class="text-sm font-medium text-zinc-500 mb-2">{formatDate(dateKey)}</h3>
						<div class="space-y-2">
							{#each entriesByDate[dateKey] as entry}
								<EntryCard.Root>
									<EntryCard.Icon emoji={data.metric.icon || '📊'} color={data.metric.color || '#3b82f6'} />
									<EntryCard.Content>
										<EntryCard.Title>{data.metric.name}</EntryCard.Title>
										<EntryCard.Meta>
											{formatTime(entry.date)}
											{#if entry.notes}
												<span class="text-zinc-400 mx-1">•</span>
												<span class="truncate">{entry.notes}</span>
											{/if}
										</EntryCard.Meta>
									</EntryCard.Content>
									<EntryCard.Value>
										<span class="text-xl font-bold" style="color: {data.metric.color || '#18181b'}">
											{entry.value}
										</span>
										{#if data.metric.unit}
											<span class="text-zinc-500 text-sm ml-1">{data.metric.unit}</span>
										{/if}
									</EntryCard.Value>
								</EntryCard.Root>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
