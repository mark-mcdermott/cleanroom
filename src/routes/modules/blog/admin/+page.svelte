<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Table, Button } from '$lib/components/ui';
	import { Plus, Pencil, Trash2, Eye, EyeOff, RotateCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleRowClick(postId: string) {
		goto(`/modules/blog/admin/${postId}/edit`);
	}

	function handleDelete(postId: string, postTitle: string) {
		if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/delete';

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'postId';
			input.value = postId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}

	function formatDate(date: Date | string | null) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Posts Admin - Blog Demo</title>
	<meta name="description" content="Manage demo blog posts" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Posts</h1>
			<p class="text-muted-foreground mt-2">Manage demo blog posts ({data.posts.length} total)</p>
		</div>
		<div class="flex gap-3">
			<form method="POST" action="?/reset" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Demo data reset successfully');
						window.location.reload();
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to reset demo data');
					}
				};
			}}>
				<Button.Root type="submit" variant="outline" class="cursor-pointer">
					<RotateCcw class="w-4 h-4 mr-2" />
					Reset Demo
				</Button.Root>
			</form>
			<Button.Root class="cursor-pointer" onclick={() => goto('/modules/blog/admin/new')}>
				<Plus class="w-4 h-4 mr-2" />
				New Post
			</Button.Root>
		</div>
	</div>

	{#if data.posts.length === 0}
		<div class="border border-border rounded-lg p-8 text-center bg-card">
			<p class="text-muted-foreground mb-4">No posts yet. Create a new post or reset demo data to get started.</p>
			<div class="flex justify-center gap-3">
				<form method="POST" action="?/reset" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('Demo data reset successfully');
							window.location.reload();
						}
					};
				}}>
					<Button.Root type="submit" variant="outline" class="cursor-pointer">
						<RotateCcw class="w-4 h-4 mr-2" />
						Reset Demo Data
					</Button.Root>
				</form>
				<Button.Root class="cursor-pointer" onclick={() => goto('/modules/blog/admin/new')}>
					<Plus class="w-4 h-4 mr-2" />
					Create your first post
				</Button.Root>
			</div>
		</div>
	{:else}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Title</Table.Head>
					<Table.Head>Slug</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Published</Table.Head>
					<Table.Head>Updated</Table.Head>
					<Table.Head class="w-24"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.posts as post}
					<Table.Row
						class="cursor-pointer"
						onclick={(e: MouseEvent) => {
							const target = e.target as HTMLElement;
							if (!target.closest('[data-action]')) {
								handleRowClick(post.id);
							}
						}}
					>
						<Table.Cell>
							<span class="font-medium">{post.title}</span>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground font-mono text-sm">
							{post.slug}
						</Table.Cell>
						<Table.Cell>
							{#if post.published}
								<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
									<Eye class="w-3 h-3" />
									Published
								</span>
							{:else}
								<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
									<EyeOff class="w-3 h-3" />
									Draft
								</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-muted-foreground text-sm">
							{formatDate(post.publishedAt)}
						</Table.Cell>
						<Table.Cell class="text-muted-foreground text-sm">
							{formatDate(post.updatedAt)}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<a
									href="/modules/blog/admin/{post.id}/edit"
									data-action="edit"
									class="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
									title="Edit post"
									onclick={(e: MouseEvent) => e.stopPropagation()}
								>
									<Pencil class="w-4 h-4" />
								</a>
								<button
									data-action="delete"
									class="p-1.5 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
									title="Delete post"
									onclick={(e: MouseEvent) => {
										e.stopPropagation();
										handleDelete(post.id, post.title);
									}}
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>

<form method="POST" action="?/delete" use:enhance={() => {
	return async ({ result }) => {
		if (result.type === 'success') {
			toast.success('Post deleted successfully');
			window.location.reload();
		} else if (result.type === 'failure') {
			toast.error((result.data as { error?: string })?.error || 'Failed to delete post');
		}
	};
}} class="hidden">
	<input type="hidden" name="postId" value="" />
</form>
