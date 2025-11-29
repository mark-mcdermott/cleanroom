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

<svelte:head><title>Photo - {data.thingy.name}</title></svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<a href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}/thingys/{data.thingy.id}"
		class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6">
		<ArrowLeft class="w-4 h-4" />Back to {data.thingy.name}
	</a>

	<div class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
		<img src={data.photo.url} alt={data.photo.caption || 'Photo'} class="w-full max-h-[600px] object-contain bg-zinc-100" />
		<div class="p-6">
			<div class="flex items-start justify-between">
				<div>
					{#if data.photo.caption}<p class="text-zinc-700">{data.photo.caption}</p>
					{:else}<p class="text-zinc-400 italic">No caption</p>{/if}
					<p class="text-sm text-zinc-400 mt-2">{data.photo.filename || 'Unknown'}</p>
				</div>
				{#if data.canEdit}
					<div class="flex gap-2">
						<Button.Root variant="outline" size="sm" class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}/photos/${data.photo.id}/edit`)}>
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
		if (result.type === 'redirect') { toast.success('Photo deleted'); goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}`); }
		else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
	};
}} class="hidden"></form>
