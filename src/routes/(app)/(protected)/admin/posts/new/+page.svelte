<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Checkbox, Textarea } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { form } = $props();

	let title = $state('');
	let slug = $state('');

	function generateSlug() {
		slug = title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}
</script>

<svelte:head>
	<title>New Post - Posts Admin</title>
	<meta name="description" content="Create a new blog post" />
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-16">
	<a
		href="/admin/posts"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to Posts
	</a>

	<div class="bg-card border border-border rounded-lg p-6">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">New Post</h1>

		{#if form?.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') {
						toast.success('Post created successfully');
						goto('/admin/posts');
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to create post');
					}
				};
			}}
			class="space-y-6"
		>
			<div class="space-y-2">
				<Label.Root for="title">Title</Label.Root>
				<Input.Root
					id="title"
					name="title"
					type="text"
					bind:value={title}
					oninput={generateSlug}
					placeholder="Enter post title"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="slug">Slug</Label.Root>
				<Input.Root
					id="slug"
					name="slug"
					type="text"
					bind:value={slug}
					placeholder="post-url-slug"
					required
				/>
				<p class="text-xs text-muted-foreground">URL-friendly identifier (lowercase, hyphens only)</p>
			</div>

			<div class="space-y-2">
				<Label.Root for="excerpt">Excerpt</Label.Root>
				<Textarea.Root
					id="excerpt"
					name="excerpt"
					placeholder="Brief summary of the post (shown on listing pages)"
					class="min-h-20"
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="content">Content</Label.Root>
				<Textarea.Root
					id="content"
					name="content"
					placeholder="Post content (HTML supported)"
					class="min-h-64 font-mono text-sm"
					required
				/>
				<p class="text-xs text-muted-foreground">HTML tags are supported for formatting</p>
			</div>

			<div class="space-y-2">
				<Label.Root for="coverImage">Cover Image URL</Label.Root>
				<Input.Root
					id="coverImage"
					name="coverImage"
					type="url"
					placeholder="https://example.com/image.jpg"
				/>
			</div>

			<div class="flex items-center gap-2 pt-2">
				<Checkbox.Root id="published" name="published" />
				<Label.Root for="published" class="text-sm font-normal">
					Publish immediately
				</Label.Root>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit" class="cursor-pointer">Create Post</Button.Root>
				<Button.Root type="button" variant="outline" class="cursor-pointer" onclick={() => goto('/admin/posts')}>
					Cancel
				</Button.Root>
			</div>
		</form>
	</div>
</div>
