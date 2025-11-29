<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft, Pencil, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleDelete() {
		if (confirm('Delete this note?')) {
			(document.getElementById('delete-form') as HTMLFormElement).requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Note - {data.thingy.name}</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<a href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}/thingys/{data.thingy.id}"
		class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6">
		<ArrowLeft class="w-4 h-4" />Back to {data.thingy.name}
	</a>

	<div class="bg-white border border-zinc-200 rounded-lg p-6">
		<div class="flex items-start justify-between mb-4">
			<h1 class="text-lg font-semibold">Note</h1>
			{#if data.canEdit}
				<div class="flex gap-2">
					<Button.Root variant="outline" size="sm" class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}/notes/${data.note.id}/edit`)}>
						<Pencil class="w-4 h-4 mr-1" />Edit
					</Button.Root>
					<Button.Root variant="destructive" size="sm" class="cursor-pointer" onclick={handleDelete}>
						<Trash2 class="w-4 h-4 mr-1" />Delete
					</Button.Root>
				</div>
			{/if}
		</div>
		<div class="prose prose-zinc max-w-none">
			<p class="whitespace-pre-wrap">{data.note.content}</p>
		</div>
		<p class="text-sm text-zinc-400 mt-4">
			Created {data.note.createdAt ? new Date(data.note.createdAt).toLocaleString() : 'N/A'}
		</p>
	</div>
</div>

<form id="delete-form" method="POST" action="?/delete" use:enhance={() => {
	return async ({ result }) => {
		if (result.type === 'redirect') {
			toast.success('Note deleted');
			goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}`);
		} else if (result.type === 'failure') {
			toast.error((result.data as { error?: string })?.error || 'Failed to delete');
		}
	};
}} class="hidden"></form>
