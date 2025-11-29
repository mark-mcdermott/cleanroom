<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Checkbox, Textarea } from '$lib/components/ui';
	import { ArrowLeft, ExternalLink } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Edit: {data.post.title} - Blog Admin</title>
	<meta name="description" content="Edit demo blog post" />
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-6">
		<a
			href="/modules/blog/admin"
			class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
		>
			<ArrowLeft class="w-4 h-4" />
			Back to Posts
		</a>
		{#if data.post.published}
			<a
				href="/modules/blog/{data.post.slug}"
				target="_blank"
				class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
			>
				View Post
				<ExternalLink class="w-4 h-4" />
			</a>
		{/if}
	</div>

	<div class="bg-white border border-zinc-200 rounded-lg p-6">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Edit Post</h1>

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
						toast.success('Post updated successfully');
						goto('/modules/blog/admin');
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to update post');
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
					value={data.post.title}
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
					value={data.post.slug}
					placeholder="post-url-slug"
					required
				/>
				<p class="text-xs text-zinc-500">URL-friendly identifier (lowercase, hyphens only)</p>
			</div>

			<div class="space-y-2">
				<Label.Root for="excerpt">Excerpt</Label.Root>
				<Textarea.Root
					id="excerpt"
					name="excerpt"
					value={data.post.excerpt || ''}
					placeholder="Brief summary of the post (shown on listing pages)"
					class="min-h-20"
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="content">Content</Label.Root>
				<Textarea.Root
					id="content"
					name="content"
					value={data.post.content}
					placeholder="Post content (HTML supported)"
					class="min-h-64 font-mono text-sm"
					required
				/>
				<p class="text-xs text-zinc-500">HTML tags are supported for formatting</p>
			</div>

			<div class="space-y-2">
				<Label.Root for="coverImage">Cover Image URL</Label.Root>
				<Input.Root
					id="coverImage"
					name="coverImage"
					type="url"
					value={data.post.coverImage || ''}
					placeholder="https://example.com/image.jpg"
				/>
			</div>

			<div class="flex items-center gap-2 pt-2">
				<Checkbox.Root id="published" name="published" checked={data.post.published} />
				<Label.Root for="published" class="text-sm font-normal">
					Published
				</Label.Root>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit" class="cursor-pointer">Save Changes</Button.Root>
				<Button.Root type="button" variant="outline" class="cursor-pointer" onclick={() => goto('/modules/blog/admin')}>
					Cancel
				</Button.Root>
			</div>
		</form>
	</div>
</div>
