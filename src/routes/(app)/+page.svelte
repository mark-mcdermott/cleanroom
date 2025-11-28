<script lang="ts">
	import { Flame } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>cleanroom</title>
	<meta name="description" content="cleanroom - SvelteKit Scaffolding Generator" />
</svelte:head>

<div class="flex justify-center items-center min-h-[70vh] px-6">
	<div class="card w-full max-w-md text-center space-y-6">
		<div class="flex justify-center mb-4">
			<img src="/logo.png" alt="cleanroom" class="w-16 h-16" />
		</div>
		<h1>cleanroom</h1>
		<h2
			class="flex items-center justify-center gap-1 text-zinc-700 font-medium tracking-hero text-base !mt-2"
		>
			Less Boilerplate, More Boil
			<Flame class="w-4 h-4 text-orange-500" />
		</h2>
		<p class="text-zinc-600 text-lg mt-3">
			Minimal SvelteKit starter with auth, database & edge deployment
		</p>
		<div class="flex gap-3 justify-center mt-6">
			<a href="/signup" class="btn btn-dark">Get Started</a>
			<a href="/components" class="btn btn-light">Components</a>
		</div>
	</div>
</div>
