<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Landing Page (No Nav) - Cleanroom</title>
	<meta name="description" content="Simple landing page example from Cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<!-- Site header -->
	<div class="px-8 py-6">
		<div class="flex items-center gap-2 text-2xl">
			<span>🦫</span>
			<span class="font-semibold tracking-tight">Landing Page (No Nav)</span>
		</div>
		<a
			href="/"
			class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mt-2"
		>
			<ArrowLeft class="w-4 h-4" />
			Back to Cleanroom
		</a>
	</div>

	<main class="flex-1">
		<div class="w-full flex justify-center items-center text-center min-h-[50vh]">
			<div class="my-16">
				<h1
					class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3"
				>
					<span class="text-5xl sm:text-6xl">🦫</span>
					Landing Page
				</h1>
				<p class="text-zinc-600 text-lg mt-6 max-w-md mx-auto px-4">
					A simple landing page with responsive design but no navigation.
				</p>
			</div>
		</div>
	</main>
</div>
