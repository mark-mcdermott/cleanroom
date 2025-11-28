<script lang="ts">
	import { ArrowLeft, Menu, X } from 'lucide-svelte';

	let mobileMenuOpen = $state(false);

	const sections = [
		{ id: 'the-map', label: 'The Map' },
		{ id: 'the-crew', label: 'The Crew' },
		{ id: 'the-voyage', label: 'The Voyage' },
		{ id: 'the-treasure', label: 'The Treasure' }
	];
</script>

<svelte:head>
	<title>Landing Sections - Cleanroom</title>
	<meta name="description" content="Landing page with sections example from Cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col scroll-smooth">
	<!-- Navigation -->
	<nav class="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-50">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<div>
				<div class="flex items-center gap-2 text-xl">
					<span>🦫</span>
					<span class="font-semibold tracking-tight">Landing Sections</span>
				</div>
				<a
					href="/"
					class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 mt-1"
				>
					<ArrowLeft class="w-3 h-3" />
					Back to Cleanroom
				</a>
			</div>

			<!-- Desktop nav -->
			<div class="hidden md:flex gap-6">
				{#each sections as section}
					<a
						href="#{section.id}"
						class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
					>
						{section.label}
					</a>
				{/each}
			</div>

			<!-- Mobile menu button -->
			<button
				class="md:hidden p-2"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<X class="w-6 h-6" />
				{:else}
					<Menu class="w-6 h-6" />
				{/if}
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t bg-white">
				<div class="px-6 py-4 flex flex-col gap-4">
					{#each sections as section}
						<a
							href="#{section.id}"
							class="text-sm text-zinc-600 hover:text-zinc-900"
							onclick={() => (mobileMenuOpen = false)}
						>
							{section.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>

	<main class="flex-1">
		<!-- Hero -->
		<section class="py-20 text-center">
			<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
				<span class="text-5xl sm:text-6xl">🦫</span>
				Landing Sections
			</h1>
			<p class="text-zinc-600 text-lg mt-6 max-w-md mx-auto px-4">
				A landing page with jump-link navigation to scroll between sections.
			</p>
		</section>

		<!-- Sections -->
		<section id="the-map" class="py-20 scroll-mt-20 bg-zinc-50">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Map</h2>
				<p class="text-zinc-600 leading-relaxed">
					Every great adventure begins with a map. This section represents the starting point of your journey.
				</p>
			</div>
		</section>

		<section id="the-crew" class="py-20 scroll-mt-20">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Crew</h2>
				<p class="text-zinc-600 leading-relaxed">
					No adventurer goes alone. Meet the team that makes it all possible.
				</p>
			</div>
		</section>

		<section id="the-voyage" class="py-20 scroll-mt-20 bg-zinc-50">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Voyage</h2>
				<p class="text-zinc-600 leading-relaxed">
					The journey itself is where the magic happens. Each step brings new discoveries.
				</p>
			</div>
		</section>

		<section id="the-treasure" class="py-20 scroll-mt-20">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Treasure</h2>
				<p class="text-zinc-600 leading-relaxed">
					At the end of every adventure lies the reward. What will you discover?
				</p>
			</div>
		</section>
	</main>

	<footer class="border-t py-6">
		<div class="text-center text-sm text-zinc-500">
			© {new Date().getFullYear()} Landing Sections
		</div>
	</footer>
</div>
