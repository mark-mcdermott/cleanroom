<script lang="ts">
	import { Nav, FloatingHero, BackLink } from '$lib/components/blocks';
</script>

<svelte:head>
	<title>Demo Site - cleanroom</title>
	<meta name="description" content="Demo page example from cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<Nav siteName="Demo Site" logo="🦫" />

	<BackLink href="/" label="Back to cleanroom" />

	<main class="flex-1">
		<FloatingHero
			title="Demo Site"
			logo="🦫"
			description="A simple demo page with no navigation or responsive breakpoints."
		/>
	</main>
</div>
