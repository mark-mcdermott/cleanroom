<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleDelete(widgetId: string, widgetName: string) {
		if (confirm(`Are you sure you want to delete "${widgetName}"?`)) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/delete';

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'widgetId';
			input.value = widgetId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}
</script>

<svelte:head>
	<title>{data.targetUser.name || data.targetUser.email}'s Widgets</title>
	<meta name="description" content="View and manage widgets" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">
				{#if data.isOwner}
					My Widgets
				{:else}
					{data.targetUser.name || data.targetUser.email}'s Widgets
				{/if}
			</h1>
			<p class="text-muted-foreground mt-2">{data.widgets.length} widget{data.widgets.length !== 1 ? 's' : ''}</p>
		</div>
		<div class="flex gap-3">
			{#if data.canEdit}
				<form method="POST" action="?/reset" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('Demo data reset!');
							window.location.reload();
						} else if (result.type === 'failure') {
							toast.error((result.data as { error?: string })?.error || 'Failed to reset');
						}
					};
				}}>
					<Button.Root type="submit" variant="outline" class="cursor-pointer">
						<RotateCcw class="w-4 h-4 mr-2" />
						Reset Demo
					</Button.Root>
				</form>
				<Button.Root onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/new`)} class="cursor-pointer">
					<Plus class="w-4 h-4 mr-2" />
					New Widget
				</Button.Root>
			{/if}
		</div>
	</div>

	{#if data.widgets.length === 0}
		<div class="border border-border rounded-lg p-8 text-center bg-card">
			<p class="text-muted-foreground mb-4">No widgets yet. Create your first widget to get started!</p>
			{#if data.canEdit}
				<div class="flex gap-3 justify-center">
					<form method="POST" action="?/reset" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success('Sample widgets created!');
								window.location.reload();
							}
						};
					}}>
						<Button.Root type="submit" variant="outline" class="cursor-pointer">
							<RotateCcw class="w-4 h-4 mr-2" />
							Create Sample Widgets
						</Button.Root>
					</form>
					<Button.Root onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/new`)} class="cursor-pointer">
						<Plus class="w-4 h-4 mr-2" />
						Create Widget
					</Button.Root>
				</div>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4">
			{#each data.widgets as widget}
				<a
					href="/modules/widgets/users/{data.targetUser.id}/widgets/{widget.id}"
					class="block bg-card border border-border rounded-lg p-6 hover:border-border hover:shadow-sm transition-all"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<h2 class="text-xl font-semibold tracking-tight">{widget.name}</h2>
							{#if widget.description}
								<p class="text-muted-foreground mt-1 line-clamp-2">{widget.description}</p>
							{/if}
							<p class="text-sm text-muted-foreground mt-3">
								Created {widget.createdAt ? new Date(widget.createdAt).toLocaleDateString() : 'N/A'}
							</p>
						</div>
						{#if data.canEdit}
							<div class="flex items-center gap-2 ml-4" onclick={(e: MouseEvent) => e.preventDefault()}>
								<a
									href="/modules/widgets/users/{data.targetUser.id}/widgets/{widget.id}/edit"
									class="p-2 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
									title="Edit widget"
								>
									<Pencil class="w-4 h-4" />
								</a>
								<button
									class="p-2 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
									title="Delete widget"
									onclick={(e: MouseEvent) => {
										e.stopPropagation();
										handleDelete(widget.id, widget.name);
									}}
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<form method="POST" action="?/delete" use:enhance={() => {
	return async ({ result }) => {
		if (result.type === 'success') {
			toast.success('Widget deleted');
			window.location.reload();
		} else if (result.type === 'failure') {
			toast.error((result.data as { error?: string })?.error || 'Failed to delete widget');
		}
	};
}} class="hidden">
	<input type="hidden" name="widgetId" value="" />
</form>
