<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea, Select } from '$lib/components/ui';
	import { ArrowLeft, Loader2, Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let isSubmitting = $state(false);
	let selectedCategoryId = $state<string | null>(null);
	let selectedMetricId = $state<string | null>(data.selectedMetric);

	// Filter metrics by selected category
	const filteredMetrics = $derived(() => {
		if (!selectedCategoryId) return data.metrics;
		return data.metrics.filter((m) => m.categoryId === selectedCategoryId);
	});

	// Get selected metric details
	const selectedMetric = $derived(() => {
		if (!selectedMetricId) return null;
		return data.metrics.find((m) => m.id === selectedMetricId);
	});

	// Set initial category based on URL param
	$effect(() => {
		if (data.selectedCategory) {
			const cat = data.categories.find((c) => c.slug === data.selectedCategory);
			if (cat) {
				selectedCategoryId = cat.id;
			}
		}
	});

	function getCategoryName(categoryId: string): string {
		const cat = data.categories.find((c) => c.id === categoryId);
		return cat?.name || 'Other';
	}

	// Get today's date in local timezone for the date input
	const today = new Date().toISOString().split('T')[0];
</script>

<svelte:head>
	<title>Log Entry - Tracker</title>
	<meta name="description" content="Log a new tracker entry" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-8">
	<a
		href="/modules/tracker"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to dashboard
	</a>

	<h1 class="text-3xl font-semibold tracking-tight mb-2">Log Entry</h1>
	<p class="text-zinc-500 dark:text-zinc-400 mb-8">Record your progress for any metric</p>

	{#if data.metrics.length === 0}
		<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
			<p class="text-zinc-600 dark:text-zinc-400 mb-4">
				No metrics set up yet. Create metrics in the admin panel first.
			</p>
			<Button.Root variant="outline" onclick={() => goto('/modules/tracker/admin')} class="cursor-pointer">
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
			<!-- Category Filter (optional) -->
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
				{#if selectedMetric() && selectedMetric()?.description}
					<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">{selectedMetric()?.description}</p>
				{/if}
			</div>

			<!-- Value Input -->
			<div>
				<Label.Root for="value">Value *</Label.Root>
				{#if selectedMetric()?.valueType === 'boolean'}
					<div class="flex gap-4 mt-2">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" name="value" value="true" class="w-4 h-4" />
							<span>Yes</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" name="value" value="false" class="w-4 h-4" />
							<span>No</span>
						</label>
					</div>
				{:else if selectedMetric()?.valueType === 'rating'}
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
						<Input.Root
							type="number"
							id="value"
							name="value"
							placeholder={selectedMetric()?.defaultValue || '0'}
							step="any"
							min={selectedMetric()?.minValue || undefined}
							max={selectedMetric()?.maxValue || undefined}
							required
						/>
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
				<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Leave as-is for current time</p>
			</div>

			<!-- Notes -->
			<div>
				<Label.Root for="notes">Notes (optional)</Label.Root>
				<Textarea.Root
					id="notes"
					name="notes"
					placeholder="Any additional notes..."
					rows={3}
					class="mt-1.5"
				/>
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
				<Button.Root
					type="button"
					variant="outline"
					onclick={() => goto('/modules/tracker')}
					class="cursor-pointer"
				>
					Cancel
				</Button.Root>
			</div>
		</form>
	{/if}
</div>
