<script lang="ts">
	import { Nav, BackLink, FloatingHero, Footer } from '$lib/components/blocks';
</script>

<svelte:head>
	<title>Landing Simple - cleanroom</title>
	<meta name="description" content="Simple landing page example from cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<Nav siteName="Landing Simple" logo="🦫" />
	<BackLink href="/" label="Back to cleanroom" />

	<main class="flex-1">
		<FloatingHero
			title="Landing Simple"
			logo="🦫"
			description="A simple landing page with responsive breakpoints and footer, but no navigation menu."
		/>
	</main>

	<Footer siteName="Landing Simple" centered />
</div>
