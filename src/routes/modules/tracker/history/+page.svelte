<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { EntryCard, Button, Select, Label } from '$lib/components/ui';
	import { ArrowLeft, Trash2, Filter } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	function handleDelete(entryId: string) {
		if (confirm('Are you sure you want to delete this entry?')) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/delete';

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'entryId';
			input.value = entryId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}

	// Group entries by date
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
	const dateKeys = $derived(Object.keys(entriesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()));
</script>

<svelte:head>
	<title>History - Tracker</title>
	<meta name="description" content="View your tracking history" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<a
		href="/modules/tracker"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to dashboard
	</a>

	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">History</h1>
			<p class="text-zinc-500 mt-1">{data.entries.length} entries</p>
		</div>

		<!-- Filter -->
		<div class="flex items-center gap-2">
			<Filter class="w-4 h-4 text-zinc-400" />
			<Select.Root
				value={data.selectedMetric || undefined}
				onValueChange={(v) => {
					if (v) {
						goto(`/modules/tracker/history?metric=${v}`);
					} else {
						goto('/modules/tracker/history');
					}
				}}
			>
				<Select.Trigger class="w-48">
					<Select.Value placeholder="All metrics" />
				</Select.Trigger>
				<Select.Content>
					{#each data.metrics as metric}
						<Select.Item value={metric.id}>
							{metric.icon || '📊'} {metric.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if data.selectedMetric}
				<Button.Root
					variant="ghost"
					size="sm"
					onclick={() => goto('/modules/tracker/history')}
					class="cursor-pointer"
				>
					Clear
				</Button.Root>
			{/if}
		</div>
	</div>

	{#if data.entries.length === 0}
		<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
			<p class="text-zinc-600">
				{data.selectedMetric ? 'No entries for this metric yet.' : 'No entries yet. Start tracking!'}
			</p>
		</div>
	{:else}
		<div class="space-y-8">
			{#each dateKeys as dateKey}
				<div>
					<h2 class="text-sm font-medium text-zinc-500 mb-3 sticky top-0 bg-background py-2">
						{formatDate(dateKey)}
					</h2>
					<div class="space-y-2">
						{#each entriesByDate[dateKey] as entry}
							<EntryCard.Root class="group">
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
									<div class="flex items-center gap-3">
										<div class="text-right">
											<span class="text-xl font-bold" style="color: {entry.metricColor || '#18181b'}">
												{entry.value}
											</span>
											{#if entry.metricUnit}
												<span class="text-zinc-500 text-sm ml-1">{entry.metricUnit}</span>
											{/if}
										</div>
										<button
											class="p-1.5 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
											onclick={() => handleDelete(entry.id)}
											title="Delete entry"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</EntryCard.Value>
							</EntryCard.Root>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Entry deleted');
				window.location.reload();
			} else if (result.type === 'failure') {
				toast.error((result.data as { error?: string })?.error || 'Failed to delete entry');
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="entryId" value="" />
</form>
