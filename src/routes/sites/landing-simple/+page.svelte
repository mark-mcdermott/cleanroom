<script lang="ts">
	// Landing Simple - Single page, no nav, responsive with footer
</script>

<svelte:head>
	<title>Willy's Treasure Hunt</title>
	<meta name="description" content="A simple landing page showcasing Cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<main class="flex-1">
		<div class="w-full flex justify-center items-center text-center min-h-[60vh]">
			<div class="my-32 sm:my-48">
				<h1
					class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3"
				>
					<span class="text-5xl sm:text-6xl">🦫</span>
					Willy's Treasure Hunt
				</h1>
				<p class="text-zinc-600 text-lg mt-6 max-w-md mx-auto px-4">
					Join Willy Wombat on an epic pirate adventure across the Southern Seas.
				</p>
			</div>
		</div>
	</main>

	<footer class="border-t">
		<div class="mx-auto max-w-6xl px-6 sm:px-10 py-8 text-sm text-zinc-600">
			&copy; {new Date().getFullYear()} Willy's Treasure Hunt
		</div>
	</footer>
</div>
