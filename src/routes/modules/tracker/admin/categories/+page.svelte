<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft, Loader2, Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>New Category - Tracker Admin</title>
	<meta name="description" content="Create a new tracker category" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-8">
	<a
		href="/modules/tracker/admin"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to admin
	</a>

	<h1 class="text-3xl font-semibold tracking-tight mb-2">New Category</h1>
	<p class="text-zinc-500 mb-8">Create a new category to organize your metrics</p>

	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'redirect') {
					toast.success('Category created successfully!');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to create category');
				}
			};
		}}
		class="space-y-6"
	>
		<!-- Name -->
		<div>
			<Label.Root for="name">Name *</Label.Root>
			<Input.Root
				type="text"
				id="name"
				name="name"
				placeholder="e.g., Exercise"
				required
				class="mt-1.5"
			/>
		</div>

		<!-- Icon -->
		<div>
			<Label.Root for="icon">Icon (Emoji) *</Label.Root>
			<Input.Root type="text" id="icon" name="icon" placeholder="e.g., 🏃" required class="mt-1.5" />
			<p class="text-sm text-zinc-500 mt-1">Choose an emoji that represents this category</p>
		</div>

		<!-- Color -->
		<div>
			<Label.Root for="color">Color</Label.Root>
			<div class="flex items-center gap-3 mt-1.5">
				<Input.Root type="color" id="color" name="color" value="#3b82f6" class="w-16 h-10 p-1" />
				<span class="text-sm text-zinc-500">Choose a color for this category</span>
			</div>
		</div>

		<!-- Description -->
		<div>
			<Label.Root for="description">Description</Label.Root>
			<Textarea.Root
				id="description"
				name="description"
				placeholder="Brief description of this category..."
				rows={3}
				class="mt-1.5"
			/>
		</div>

		<!-- Submit -->
		<div class="flex items-center gap-4 pt-4">
			<Button.Root type="submit" class="cursor-pointer" disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					Creating...
				{:else}
					<Save class="w-4 h-4 mr-2" />
					Create Category
				{/if}
			</Button.Root>
			<Button.Root
				type="button"
				variant="outline"
				onclick={() => goto('/modules/tracker/admin')}
				class="cursor-pointer"
			>
				Cancel
			</Button.Root>
		</div>
	</form>
</div>
