<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft, Upload } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
	let previewUrl = $state<string | null>(null);
	let uploading = $state(false);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			previewUrl = URL.createObjectURL(file);
		}
	}
</script>

<svelte:head>
	<title>Add Photo - {data.widget.name}</title>
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
		<ArrowLeft class="w-4 h-4" />Back to {data.widget.name}
	</a>

	<div class="border border-border rounded-lg p-6 bg-card">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Add Photo</h1>

		{#if form?.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{form.error}</div>
		{/if}

		<form method="POST" enctype="multipart/form-data" use:enhance={() => {
			uploading = true;
			return async ({ result }) => {
				uploading = false;
				if (result.type === 'redirect') {
					toast.success('Photo added!');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to upload');
				}
			};
		}} class="space-y-4">
			<div class="space-y-2">
				<Label.Root for="photo">Photo</Label.Root>
				<div class="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/50 transition-colors">
					{#if previewUrl}
						<img src={previewUrl} alt="Preview" class="max-h-48 mx-auto mb-4 rounded" />
					{:else}
						<Upload class="w-8 h-8 mx-auto text-muted-foreground mb-2" />
						<p class="text-sm text-muted-foreground">Click to select or drag and drop</p>
						<p class="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP (max 5MB)</p>
					{/if}
					<Input.Root id="photo" name="photo" type="file" accept="image/*" onchange={handleFileChange} class="mt-2" required />
				</div>
			</div>

			<div class="space-y-2">
				<Label.Root for="caption">Caption (optional)</Label.Root>
				<Textarea.Root id="caption" name="caption" placeholder="Add a caption..." rows={3} />
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit" disabled={uploading}>
					{uploading ? 'Uploading...' : 'Add Photo'}
				</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}`)}>Cancel</Button.Root>
			</div>
		</form>
	</div>
</div>
