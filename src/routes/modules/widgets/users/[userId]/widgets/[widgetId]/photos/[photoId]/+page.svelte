<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft, Pencil, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleDelete() {
		if (confirm('Delete this photo?')) {
			(document.getElementById('delete-form') as HTMLFormElement).requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Photo - {data.widget.name}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<a href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
		<ArrowLeft class="w-4 h-4" />Back to {data.widget.name}
	</a>

	<div class="bg-card border border-border rounded-lg overflow-hidden">
		<img src={data.photo.url} alt={data.photo.caption || 'Photo'} class="w-full max-h-[600px] object-contain bg-muted" />
		<div class="p-6">
			<div class="flex items-start justify-between">
				<div>
					{#if data.photo.caption}
						<p class="text-muted-foreground">{data.photo.caption}</p>
					{:else}
						<p class="text-muted-foreground italic">No caption</p>
					{/if}
					<p class="text-sm text-muted-foreground mt-2">
						{data.photo.filename || 'Unknown'} &bull; Added {data.photo.createdAt ? new Date(data.photo.createdAt).toLocaleString() : 'N/A'}
					</p>
				</div>
				{#if data.canEdit}
					<div class="flex gap-2">
						<Button.Root variant="outline" size="sm" class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/photos/${data.photo.id}/edit`)}>
							<Pencil class="w-4 h-4 mr-1" />Edit
						</Button.Root>
						<Button.Root variant="destructive" size="sm" class="cursor-pointer" onclick={handleDelete}>
							<Trash2 class="w-4 h-4 mr-1" />Delete
						</Button.Root>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<form id="delete-form" method="POST" action="?/delete" use:enhance={() => {
	return async ({ result }) => {
		if (result.type === 'redirect') {
			toast.success('Photo deleted');
			goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}`);
		} else if (result.type === 'failure') {
			toast.error((result.data as { error?: string })?.error || 'Failed to delete');
		}
	};
}} class="hidden"></form>
