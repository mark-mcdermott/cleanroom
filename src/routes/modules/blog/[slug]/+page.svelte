<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { Prose, PostCard } from '$lib/components/ui';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.excerpt || data.post.title} />
</svelte:head>

<article class="max-w-3xl mx-auto px-6 py-16">
	<header class="mb-10">
		<a
			href="/modules/blog"
			class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-6"
		>
			<ArrowLeft class="w-4 h-4" />
			Back to blog
		</a>
		<h1 class="text-4xl font-semibold tracking-tight">{data.post.title}</h1>
		<PostCard.Date date={data.post.publishedAt || data.post.createdAt} class="mt-3" />
	</header>

	{#if data.post.coverImage}
		<img
			src={data.post.coverImage}
			alt={data.post.title}
			class="w-full h-64 object-cover rounded-lg mb-10"
		/>
	{/if}

	<Prose.Root html={data.post.content} />
</article>
