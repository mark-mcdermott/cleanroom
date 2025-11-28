<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { FloatingHero } from '$lib/components/blocks';
</script>

<svelte:head>
	<title>Demo Site - cleanroom</title>
	<meta name="description" content="Demo page example from cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<!-- Site header -->
	<div class="px-8 py-6">
		<div class="flex items-center gap-2 text-2xl">
			<span>🦫</span>
			<span class="font-semibold tracking-tight">Demo Site</span>
		</div>
		<a
			href="/"
			class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mt-2"
		>
			<ArrowLeft class="w-4 h-4" />
			Back to cleanroom
		</a>
	</div>

	<main class="flex-1">
		<FloatingHero
			title="Demo Site"
			logo="🦫"
			description="A simple demo page with no navigation or responsive breakpoints."
		/>
	</main>
</div>
