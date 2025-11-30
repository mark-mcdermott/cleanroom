<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft, Plus, Trash2, Upload, Images } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let showUpload = $state(false);
	let uploading = $state(false);
	let previewUrl = $state<string | null>(null);

	function handleFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) previewUrl = URL.createObjectURL(file);
	}
</script>

<svelte:head><title>Gallery - {data.widget.name}</title></svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<a href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
		<ArrowLeft class="w-4 h-4" />Back to {data.widget.name}
	</a>

	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold tracking-tight flex items-center gap-2">
			<Images class="w-6 h-6 text-muted-foreground" />
			{data.gallery?.name || 'Gallery'}
		</h1>
		{#if data.canEdit && data.gallery}
			<Button.Root variant="outline" class="cursor-pointer" onclick={() => showUpload = !showUpload}>
				<Plus class="w-4 h-4 mr-2" />{showUpload ? 'Cancel' : 'Add Photo'}
			</Button.Root>
		{/if}
	</div>

	{#if !data.gallery}
		<div class="bg-card border border-border rounded-lg p-8 text-center">
			<Images class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
			<p class="text-muted-foreground mb-4">No gallery created yet.</p>
			{#if data.canEdit}
				<form method="POST" action="?/createGallery" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') { toast.success('Gallery created!'); window.location.reload(); }
						else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
					};
				}}>
					<Button.Root type="submit">Create Gallery</Button.Root>
				</form>
			{/if}
		</div>
	{:else}
		{#if showUpload && data.canEdit}
			<div class="bg-card border border-border rounded-lg p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Add Photo to Gallery</h2>
				<form method="POST" action="?/addPhoto" enctype="multipart/form-data" use:enhance={() => {
					uploading = true;
					return async ({ result }) => {
						uploading = false;
						if (result.type === 'success') { toast.success('Photo added!'); showUpload = false; previewUrl = null; window.location.reload(); }
						else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
					};
				}} class="space-y-4">
					<input type="hidden" name="galleryId" value={data.gallery.id} />
					<div class="space-y-2">
						<Label.Root for="photo">Photo</Label.Root>
						<div class="border-2 border-dashed border-border rounded-lg p-4 text-center">
							{#if previewUrl}<img src={previewUrl} alt="Preview" class="max-h-32 mx-auto mb-2 rounded" />{:else}<Upload class="w-6 h-6 mx-auto text-muted-foreground" />{/if}
							<Input.Root id="photo" name="photo" type="file" accept="image/*" onchange={handleFileChange} class="mt-2" required />
						</div>
					</div>
					<div class="space-y-2">
						<Label.Root for="caption">Caption (optional)</Label.Root>
						<Textarea.Root id="caption" name="caption" rows={2} />
					</div>
					<Button.Root type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Add to Gallery'}</Button.Root>
				</form>
			</div>
		{/if}

		{#if data.photos.length === 0}
			<div class="bg-card border border-border rounded-lg p-8 text-center">
				<p class="text-muted-foreground">Gallery is empty. Add some photos!</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
				{#each data.photos as photo}
					<div class="relative group aspect-square bg-muted rounded-lg overflow-hidden">
						<img src={photo.url} alt={photo.caption || 'Gallery photo'} class="w-full h-full object-cover" />
						{#if photo.caption}
							<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
								<p class="text-white text-sm line-clamp-2">{photo.caption}</p>
							</div>
						{/if}
						{#if data.canEdit}
							<form method="POST" action="?/removePhoto" use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') { toast.success('Removed'); window.location.reload(); }
									else if (result.type === 'failure') { toast.error('Failed to remove'); }
								};
							}} class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<input type="hidden" name="photoId" value={photo.id} />
								<button type="submit" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer">
									<Trash2 class="w-4 h-4" />
								</button>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
