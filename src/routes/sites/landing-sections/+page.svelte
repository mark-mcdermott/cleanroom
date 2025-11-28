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
				<p class="text-zinc-600 leading-relaxed mb-4">
					Every great adventure begins with a map. Willy Wombat had heard whispers of the legendary Eucalyptus Crown—a treasure said to grant its bearer the wisdom of the ancient forest. The map arrived one stormy night, slipped under the door of his burrow by an unknown paw. Faded and torn at the edges, it showed a path through the Whispering Woods, across the Serpent River, and into the heart of the Forgotten Caves.
				</p>
				<p class="text-zinc-600 leading-relaxed">
					The journey would be treacherous. The map marked danger zones with tiny skull symbols and noted cryptic warnings in a language Willy could barely decipher. But one thing was clear: the treasure was real, and someone had gone to great lengths to ensure it would be found. Willy traced the route with his claw, memorizing every twist and turn. Tomorrow at dawn, the adventure would begin.
				</p>
			</div>
		</section>

		<section id="the-crew" class="py-20 scroll-mt-20">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Crew</h2>
				<p class="text-zinc-600 leading-relaxed mb-4">
					No wombat should face the Forgotten Caves alone. Willy knew he'd need help—and not just any help. He called upon his most trusted companions: Patches the one-eyed possum, whose night vision was legendary despite her missing eye; Captain Feathers, a cockatoo who'd sailed the skies from Sydney to Perth and back; and Digger Dan, a fellow wombat whose tunnel-crafting skills were unmatched in three territories.
				</p>
				<p class="text-zinc-600 leading-relaxed">
					They gathered at the old hollow log by moonlight, each bringing their unique talents to the table. Patches brought her collection of skeleton keys and lockpicks. Captain Feathers provided aerial reconnaissance maps he'd sketched during his migrations. And Digger Dan? He brought shovels. Lots of shovels. "You never know when you'll need to dig your way out of trouble," he said with a knowing wink. Together, they formed an unlikely but unstoppable crew.
				</p>
			</div>
		</section>

		<section id="the-voyage" class="py-20 scroll-mt-20 bg-zinc-50">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Voyage</h2>
				<p class="text-zinc-600 leading-relaxed mb-4">
					The Whispering Woods lived up to their name. Strange voices seemed to echo from every direction, trying to lead the crew astray. But Patches' keen ears could distinguish real sounds from phantom ones, guiding them true. When they reached the Serpent River, its waters churned with an unnatural fury. Captain Feathers spotted stepping stones hidden beneath the surface, visible only from above.
				</p>
				<p class="text-zinc-600 leading-relaxed">
					The Forgotten Caves presented their greatest challenge. The entrance was sealed by a massive boulder that had defeated countless treasure hunters before. But Digger Dan simply smiled, pulled out his favorite shovel, and got to work. Three hours later, a tunnel emerged around the boulder, leading into the cool darkness beyond. The walls glittered with phosphorescent moss, lighting their path deeper into the mountain. They were close now—Willy could feel it in his whiskers.
				</p>
			</div>
		</section>

		<section id="the-treasure" class="py-20 scroll-mt-20">
			<div class="max-w-4xl mx-auto px-6">
				<h2 class="text-3xl font-semibold mb-6">The Treasure</h2>
				<p class="text-zinc-600 leading-relaxed mb-4">
					The chamber opened before them like a cathedral carved by time itself. And there, resting on a pedestal of ancient stone, sat the Eucalyptus Crown. It was more beautiful than any of them had imagined—woven from golden eucalyptus leaves that somehow still held their fresh scent after centuries. But as Willy approached, he realized the true treasure wasn't the crown at all.
				</p>
				<p class="text-zinc-600 leading-relaxed">
					Inscribed on the pedestal were words that would change him forever: "The greatest treasure is not what you find, but who finds it with you." Willy looked back at his crew—Patches, Captain Feathers, and Digger Dan—and understood. They had faced fears, solved puzzles, and trusted each other through every challenge. He placed the crown gently back on its pedestal. Some treasures, he realized, are meant to stay right where they are, waiting for the next band of adventurers to discover what really matters.
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
