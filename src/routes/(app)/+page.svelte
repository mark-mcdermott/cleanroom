<script lang="ts">
	import { Hero } from '$lib/components/blocks';

	let { data } = $props();
</script>

<svelte:head>
	<title>cleanroom</title>
	<meta name="description" content="cleanroom - SvelteKit Scaffolding Generator" />
</svelte:head>

<Hero
	title="cleanroom"
	logo="/logo.png"
	tagline="Less Boilerplate, More Boil"
	showFlame={true}
	description="Minimal SvelteKit starter with auth, database & edge deployment"
>
	<a href="/signup" class="btn btn-dark">Get Started</a>
	<a href="/components" class="btn btn-light">Components</a>
</Hero>
