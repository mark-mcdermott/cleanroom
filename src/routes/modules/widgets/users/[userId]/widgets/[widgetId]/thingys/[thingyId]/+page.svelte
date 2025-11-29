<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft, Pencil, Trash2, Plus, Image, StickyNote } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${data.thingy.name}"? This will also delete all notes and photos.`)) {
			const form = document.getElementById('delete-form') as HTMLFormElement;
			form.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>{data.thingy.name} - {data.widget.name}</title>
	<meta name="description" content={data.thingy.description || 'View thingy details'} />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<a
		href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}"
		class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to {data.widget.name}
	</a>

	<div class="bg-white border border-zinc-200 rounded-lg p-6 mb-6">
		<div class="flex items-start justify-between mb-4">
			<div>
				<p class="text-sm text-zinc-500 mb-1">Thingy</p>
				<h1 class="text-2xl font-semibold tracking-tight">{data.thingy.name}</h1>
				{#if data.thingy.description}
					<p class="text-zinc-600 mt-2">{data.thingy.description}</p>
				{/if}
			</div>
			{#if data.canEdit}
				<div class="flex gap-2">
					<Button.Root variant="outline" class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}/edit`)}>
						<Pencil class="w-4 h-4 mr-2" />
						Edit
					</Button.Root>
					<Button.Root variant="destructive" class="cursor-pointer" onclick={handleDelete}>
						<Trash2 class="w-4 h-4 mr-2" />
						Delete
					</Button.Root>
				</div>
			{/if}
		</div>

		{#if data.currentUser?.admin}
			<div class="text-sm text-zinc-500 border-t border-zinc-200 pt-4 mt-4 space-y-1">
				<div class="flex justify-between">
					<span>ID</span>
					<span class="font-mono">{data.thingy.id}</span>
				</div>
				<div class="flex justify-between">
					<span>Created</span>
					<span>{data.thingy.createdAt ? new Date(data.thingy.createdAt).toLocaleString() : 'N/A'}</span>
				</div>
				<div class="flex justify-between">
					<span>Updated</span>
					<span>{data.thingy.updatedAt ? new Date(data.thingy.updatedAt).toLocaleString() : 'N/A'}</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Notes Section -->
	<div class="bg-white border border-zinc-200 rounded-lg p-6 mb-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold flex items-center gap-2">
				<StickyNote class="w-5 h-5 text-zinc-400" />
				Notes ({data.notes.length})
			</h2>
			{#if data.canEdit}
				<Button.Root variant="outline" size="sm" class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}/notes/new`)}>
					<Plus class="w-4 h-4 mr-1" />
					Add Note
				</Button.Root>
			{/if}
		</div>
		{#if data.notes.length === 0}
			<p class="text-zinc-500 text-sm">No notes yet.</p>
		{:else}
			<div class="space-y-2">
				{#each data.notes as note}
					<a
						href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}/thingys/{data.thingy.id}/notes/{note.id}"
						class="block p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
					>
						<div class="text-sm text-zinc-700 line-clamp-2">{note.content}</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Photos Section -->
	<div class="bg-white border border-zinc-200 rounded-lg p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold flex items-center gap-2">
				<Image class="w-5 h-5 text-zinc-400" />
				Photos ({data.photos.length})
			</h2>
			{#if data.canEdit}
				<Button.Root variant="outline" size="sm" class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}/photos/new`)}>
					<Plus class="w-4 h-4 mr-1" />
					Add Photo
				</Button.Root>
			{/if}
		</div>
		{#if data.photos.length === 0}
			<p class="text-zinc-500 text-sm">No photos yet.</p>
		{:else}
			<div class="grid grid-cols-3 gap-3">
				{#each data.photos as photo}
					<a
						href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}/thingys/{data.thingy.id}/photos/{photo.id}"
						class="aspect-square bg-zinc-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
					>
						<img src={photo.url} alt={photo.caption || 'Photo'} class="w-full h-full object-cover" />
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<form
	id="delete-form"
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Thingy deleted');
				goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}`);
			} else if (result.type === 'failure') {
				toast.error((result.data as { error?: string })?.error || 'Failed to delete thingy');
			}
		};
	}}
	class="hidden"
></form>
