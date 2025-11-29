<script lang="ts">
	import { PostCard } from '$lib/components/ui';

	let { data } = $props();
</script>

<svelte:head>
	<title>Blog</title>
	<meta name="description" content="Latest blog posts" />
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight mb-2">Blog</h1>
	<p class="text-zinc-600 mb-12">Latest thoughts, ideas, and updates.</p>

	{#if data.posts.length === 0}
		<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
			<p class="text-zinc-600">No posts yet. Run <code class="bg-zinc-100 px-2 py-1 rounded">pnpm db:seed</code> to create sample posts.</p>
		</div>
	{:else}
		<div class="space-y-10">
			{#each data.posts as post}
				<article>
					<PostCard.Root href="/modules/blog/{post.slug}">
						<PostCard.Image src={post.coverImage} alt={post.title} />
						<PostCard.Title>{post.title}</PostCard.Title>
						{#if post.excerpt}
							<PostCard.Excerpt>{post.excerpt}</PostCard.Excerpt>
						{/if}
						<PostCard.Date date={post.publishedAt || post.createdAt} />
					</PostCard.Root>
				</article>
			{/each}
		</div>
	{/if}
</div>
