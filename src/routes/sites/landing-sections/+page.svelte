<script lang="ts">
	// Landing Sections - Single page with section nav & mobile menu
	let mobileMenuOpen = $state(false);

	const sections = [
		{ id: 'the-map', title: 'The Map' },
		{ id: 'the-crew', title: 'The Crew' },
		{ id: 'the-voyage', title: 'The Voyage' },
		{ id: 'the-treasure', title: 'The Treasure' }
	];
</script>

<svelte:head>
	<title>Willy's Treasure Hunt</title>
	<meta name="description" content="A landing page with scroll sections showcasing Cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<!-- Nav -->
	<nav class="w-full flex items-center justify-between px-8 py-6">
		<a href="/sites/landing-sections" class="text-2xl no-underline hover:no-underline">
			<span>🦫</span>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden md:flex gap-6 items-center">
			{#each sections as section}
				<a
					href="#{section.id}"
					class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
				>
					{section.title}
				</a>
			{/each}
		</div>

		<!-- Mobile Hamburger -->
		<button
			class="md:hidden p-2"
			onclick={() => (mobileMenuOpen = true)}
			aria-label="Open navigation menu"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>
	</nav>

	<!-- Mobile Menu Overlay -->
	{#if mobileMenuOpen}
		<div class="fixed inset-0 z-50 md:hidden">
			<!-- Backdrop -->
			<button
				class="absolute inset-0 bg-black/50"
				onclick={() => (mobileMenuOpen = false)}
				aria-label="Close menu"
			></button>

			<!-- Drawer -->
			<div class="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
				<div class="flex items-center justify-between p-4 border-b">
					<span class="font-semibold">Willy's Treasure Hunt</span>
					<button onclick={() => (mobileMenuOpen = false)} aria-label="Close menu">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div class="p-4 flex flex-col gap-2">
					{#each sections as section}
						<a
							href="#{section.id}"
							class="block py-2 text-zinc-700 hover:text-zinc-900"
							onclick={() => (mobileMenuOpen = false)}
						>
							{section.title}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<main class="flex-1">
		<!-- Hero -->
		<div class="w-full flex justify-center items-center text-center min-h-[80vh]">
			<div class="my-16 sm:my-24">
				<h1
					class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3"
				>
					<span class="text-5xl sm:text-6xl">🦫</span>
					Willy's Treasure Hunt
				</h1>
				<div class="flex flex-wrap justify-center gap-4 mt-8">
					{#each sections as section}
						<a href="#{section.id}" class="btn btn-light">{section.title}</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- The Map -->
		<section id="the-map" class="py-24 px-8 scroll-mt-20">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-semibold tracking-tight mb-6">The Map</h2>
				<div class="space-y-4">
					<p class="text-zinc-600 text-lg mb-4">
						It all started when Willy Wombat found the old sea chest in his grandmother's attic.
						Inside, beneath moth-eaten sailor's clothes and a tarnished compass, lay a weathered
						map—hand-drawn on what looked like kangaroo hide. The faded ink spelled out words that
						made his whiskers twitch: "Captain Blackpaw's Lost Treasure of the Southern Seas."
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						His grandmother had always said their ancestor was a famous buccaneer, but Willy had
						assumed it was just another one of her tall tales. The map said otherwise. X marked a
						spot on an uncharted island, somewhere past the reef where the old lighthouse keeper
						warned ships never to sail.
					</p>
					<p class="text-zinc-600 text-lg">
						Willy knew right then: he had to find it. Not for the gold—well, maybe a little for the
						gold—but for the adventure. For the proof that the stories were real. For the chance to
						be more than just another wombat digging tunnels in the outback.
					</p>
				</div>
			</div>
		</section>

		<!-- The Crew -->
		<section id="the-crew" class="py-24 px-8 scroll-mt-20 bg-zinc-50">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-semibold tracking-tight mb-6">The Crew</h2>
				<div class="space-y-4">
					<p class="text-zinc-600 text-lg mb-4">
						No wombat sails alone. Willy gathered the most unlikely band of misfits the harbor had
						ever seen.
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						First was Peggy the Pelican, a former mail carrier who'd flown every route across the
						Pacific and knew the winds like the back of her wing. She talked too much and ate more
						fish than seemed physically possible, but there wasn't a storm she couldn't navigate.
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						Then came the twins: Rusty and Dusty, two red kangaroos who'd been kicked out of every
						boxing ring on the continent for "excessive enthusiasm." What they lacked in brains, they
						made up for in loyalty and an uncanny ability to punch through locked doors.
					</p>
					<p class="text-zinc-600 text-lg">
						And finally, there was Old Murray the sea turtle, who claimed to be 200 years old and may
						have actually met Captain Blackpaw himself. He moved slow, but he remembered
						everything—every reef, every current, every pirate song ever sung under southern stars.
						Together, they were chaos. But they were Willy's chaos.
					</p>
				</div>
			</div>
		</section>

		<!-- The Voyage -->
		<section id="the-voyage" class="py-24 px-8 scroll-mt-20">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-semibold tracking-tight mb-6">The Voyage</h2>
				<div class="space-y-4">
					<p class="text-zinc-600 text-lg mb-4">
						The voyage was rougher than anyone expected. Three days out, they hit the Storm of the
						Century—or at least that's what Old Murray called it, though Peggy pointed out he called
						every storm that.
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						Waves taller than ghost gums crashed over the deck. Lightning split the sky like cracks
						in old porcelain. Willy clung to the wheel while Rusty and Dusty bailed water and Peggy
						shouted directions from somewhere in the howling darkness above.
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						They lost the mainsail. They lost half their supplies. Dusty lost his favorite hat, which
						he wouldn't stop talking about for days.
					</p>
					<p class="text-zinc-600 text-lg">
						But they didn't lose hope. Because on the morning of the fourth day, the clouds parted
						like curtains on a stage, and there it was: an island that wasn't on any official chart.
						Palm trees swaying. White sand gleaming. And somewhere in that jungle, if the map was
						right, a fortune waiting to be found.
					</p>
				</div>
			</div>
		</section>

		<!-- The Treasure -->
		<section id="the-treasure" class="py-24 px-8 scroll-mt-20 bg-zinc-50">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl font-semibold tracking-tight mb-6">The Treasure</h2>
				<div class="space-y-4">
					<p class="text-zinc-600 text-lg mb-4">The booby traps nearly got them. Twice.</p>
					<p class="text-zinc-600 text-lg mb-4">
						Willy's burrowing instincts saved the crew from a pit of spikes, and Old Murray's ancient
						memory helped them solve the riddle carved into the cave entrance: "Only those who dig
						deep find what glitters."
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						The treasure chamber was everything Willy had dreamed of and nothing like he expected.
						Yes, there were gold doubloons stacked in pyramids. Yes, there were rubies the size of
						plums and pearls that glowed in the torchlight. But in the center of it all sat a small
						wooden box, and inside that box was something worth more than all the gold combined.
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						A letter. From Captain Blackpaw to his descendants. It spoke of adventure being the real
						treasure. Of the friends you make and the fears you face. Of how the journey matters more
						than the destination.
					</p>
					<p class="text-zinc-600 text-lg mb-4">
						Willy folded the letter carefully and tucked it into his vest. Then he looked at his
						crew—Peggy preening proudly, the twins stuffing their pouches with coins, Old Murray
						smiling that ancient knowing smile.
					</p>
					<p class="text-zinc-600 text-lg">
						"Alright, mates," Willy said. "Let's go home. We've got stories to tell." And they did.
						The best stories the harbor had ever heard.
					</p>
				</div>
			</div>
		</section>
	</main>

	<footer class="border-t">
		<div class="mx-auto max-w-6xl px-6 sm:px-10 py-8 text-sm text-zinc-600">
			&copy; {new Date().getFullYear()} Willy's Treasure Hunt
		</div>
	</footer>
</div>

<style>
	html {
		scroll-behavior: smooth;
	}
</style>
