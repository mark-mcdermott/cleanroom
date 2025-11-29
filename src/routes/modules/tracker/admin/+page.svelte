<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Table, Button } from '$lib/components/ui';
	import { Plus, Pencil, Trash2, RotateCcw, Archive, Layers } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleDeleteMetric(metricId: string, metricName: string) {
		if (confirm(`Are you sure you want to delete "${metricName}"? This will also delete all entries for this metric.`)) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/deleteMetric';

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'metricId';
			input.value = metricId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}

	function handleDeleteCategory(categoryId: string, categoryName: string) {
		if (confirm(`Are you sure you want to delete "${categoryName}"? This will also delete all metrics and entries in this category.`)) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/deleteCategory';

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'categoryId';
			input.value = categoryId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}

	function getCategoryName(categoryId: string): string {
		const cat = data.categories.find((c) => c.id === categoryId);
		return cat?.name || 'Uncategorized';
	}

	function getCategoryIcon(categoryId: string): string {
		const cat = data.categories.find((c) => c.id === categoryId);
		return cat?.icon || '📊';
	}
</script>

<svelte:head>
	<title>Admin - Tracker</title>
	<meta name="description" content="Manage tracker categories and metrics" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Tracker Admin</h1>
			<p class="text-zinc-500 mt-1">Manage categories and metrics</p>
		</div>
		<form
			method="POST"
			action="?/reset"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Demo data reset successfully');
						window.location.reload();
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to reset demo data');
					}
				};
			}}
		>
			<Button.Root type="submit" variant="outline" class="cursor-pointer">
				<RotateCcw class="w-4 h-4 mr-2" />
				Reset Demo
			</Button.Root>
		</form>
	</div>

	<!-- Categories Section -->
	<div class="mb-12">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold flex items-center gap-2">
				<Layers class="w-5 h-5" />
				Categories
			</h2>
			<Button.Root variant="outline" onclick={() => goto('/modules/tracker/admin/categories')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				New Category
			</Button.Root>
		</div>

		{#if data.categories.length === 0}
			<div class="border border-zinc-200 rounded-lg p-6 text-center bg-white">
				<p class="text-zinc-600 mb-4">No categories yet. Reset demo data or create one manually.</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
				{#each data.categories as category}
					<div class="p-4 bg-white rounded-lg border border-border hover:border-zinc-300 transition-colors group relative">
						<span class="text-2xl">{category.icon || '📊'}</span>
						<h3 class="font-medium mt-2">{category.name}</h3>
						<p class="text-xs text-zinc-500 mt-0.5">
							{data.metrics.filter((m) => m.categoryId === category.id).length} metrics
						</p>
						<button
							class="absolute top-2 right-2 p-1 rounded text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
							onclick={() => handleDeleteCategory(category.id, category.name)}
							title="Delete category"
						>
							<Trash2 class="w-4 h-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Metrics Section -->
	<div>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold">Metrics</h2>
			<Button.Root onclick={() => goto('/modules/tracker/admin/metrics/new')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				New Metric
			</Button.Root>
		</div>

		{#if data.metrics.length === 0}
			<div class="border border-zinc-200 rounded-lg p-6 text-center bg-white">
				<p class="text-zinc-600 mb-4">No metrics yet. Reset demo data or create one manually.</p>
			</div>
		{:else}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Metric</Table.Head>
						<Table.Head>Category</Table.Head>
						<Table.Head>Unit</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="w-24"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.metrics as metric}
						<Table.Row
							class="cursor-pointer"
							onclick={(e: MouseEvent) => {
								const target = e.target as HTMLElement;
								if (!target.closest('[data-action]')) {
									goto(`/modules/tracker/admin/metrics/${metric.id}/edit`);
								}
							}}
						>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<span>{metric.icon || '📊'}</span>
									<span class="font-medium">{metric.name}</span>
								</div>
							</Table.Cell>
							<Table.Cell class="text-zinc-500">
								{getCategoryIcon(metric.categoryId)} {getCategoryName(metric.categoryId)}
							</Table.Cell>
							<Table.Cell class="text-zinc-500">
								{metric.unit || '—'}
							</Table.Cell>
							<Table.Cell>
								<span class="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">
									{metric.valueType}
								</span>
							</Table.Cell>
							<Table.Cell>
								{#if metric.archived}
									<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
										<Archive class="w-3 h-3" />
										Archived
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
										Active
									</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<a
										href="/modules/tracker/admin/metrics/{metric.id}/edit"
										data-action="edit"
										class="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
										title="Edit metric"
										onclick={(e: MouseEvent) => e.stopPropagation()}
									>
										<Pencil class="w-4 h-4" />
									</a>
									<button
										data-action="delete"
										class="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
										title="Delete metric"
										onclick={(e: MouseEvent) => {
											e.stopPropagation();
											handleDeleteMetric(metric.id, metric.name);
										}}
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</div>
</div>

<!-- Hidden forms for deletion -->
<form
	method="POST"
	action="?/deleteMetric"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Metric deleted');
				window.location.reload();
			} else if (result.type === 'failure') {
				toast.error((result.data as { error?: string })?.error || 'Failed to delete metric');
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="metricId" value="" />
</form>

<form
	method="POST"
	action="?/deleteCategory"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Category deleted');
				window.location.reload();
			} else if (result.type === 'failure') {
				toast.error((result.data as { error?: string })?.error || 'Failed to delete category');
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="categoryId" value="" />
</form>
