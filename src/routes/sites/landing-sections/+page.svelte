<script lang="ts">
	import { Nav, BackLink, FloatingHero, Footer, StripedSections } from '$lib/components/blocks';
	import type { NavLink, Section } from '$lib/components/blocks';
	import { Github } from 'lucide-svelte';

	const sections: Section[] = [
		{
			id: 'the-map',
			title: 'The Map',
			content: [
				'Every great adventure begins with a map. Willy Wombat had heard whispers of the legendary Eucalyptus Crown—a treasure said to grant its bearer the wisdom of the ancient forest. The map arrived one stormy night, slipped under the door of his burrow by an unknown paw. Faded and torn at the edges, it showed a path through the Whispering Woods, across the Serpent River, and into the heart of the Forgotten Caves.',
				'The journey would be treacherous. The map marked danger zones with tiny skull symbols and noted cryptic warnings in a language Willy could barely decipher. But one thing was clear: the treasure was real, and someone had gone to great lengths to ensure it would be found. Willy traced the route with his claw, memorizing every twist and turn. Tomorrow at dawn, the adventure would begin.'
			]
		},
		{
			id: 'the-crew',
			title: 'The Crew',
			content: [
				"No wombat should face the Forgotten Caves alone. Willy knew he'd need help—and not just any help. He called upon his most trusted companions: Patches the one-eyed possum, whose night vision was legendary despite her missing eye; Captain Feathers, a cockatoo who'd sailed the skies from Sydney to Perth and back; and Digger Dan, a fellow wombat whose tunnel-crafting skills were unmatched in three territories.",
				'They gathered at the old hollow log by moonlight, each bringing their unique talents to the table. Patches brought her collection of skeleton keys and lockpicks. Captain Feathers provided aerial reconnaissance maps he\'d sketched during his migrations. And Digger Dan? He brought shovels. Lots of shovels. "You never know when you\'ll need to dig your way out of trouble," he said with a knowing wink. Together, they formed an unlikely but unstoppable crew.'
			]
		},
		{
			id: 'the-voyage',
			title: 'The Voyage',
			content: [
				"The Whispering Woods lived up to their name. Strange voices seemed to echo from every direction, trying to lead the crew astray. But Patches' keen ears could distinguish real sounds from phantom ones, guiding them true. When they reached the Serpent River, its waters churned with an unnatural fury. Captain Feathers spotted stepping stones hidden beneath the surface, visible only from above.",
				'The Forgotten Caves presented their greatest challenge. The entrance was sealed by a massive boulder that had defeated countless treasure hunters before. But Digger Dan simply smiled, pulled out his favorite shovel, and got to work. Three hours later, a tunnel emerged around the boulder, leading into the cool darkness beyond. The walls glittered with phosphorescent moss, lighting their path deeper into the mountain. They were close now—Willy could feel it in his whiskers.'
			]
		},
		{
			id: 'the-treasure',
			title: 'The Treasure',
			content: [
				"The chamber opened before them like a cathedral carved by time itself. And there, resting on a pedestal of ancient stone, sat the Eucalyptus Crown. It was more beautiful than any of them had imagined—woven from golden eucalyptus leaves that somehow still held their fresh scent after centuries. But as Willy approached, he realized the true treasure wasn't the crown at all.",
				'Inscribed on the pedestal were words that would change him forever: "The greatest treasure is not what you find, but who finds it with you." Willy looked back at his crew—Patches, Captain Feathers, and Digger Dan—and understood. They had faced fears, solved puzzles, and trusted each other through every challenge. He placed the crown gently back on its pedestal. Some treasures, he realized, are meant to stay right where they are, waiting for the next band of adventurers to discover what really matters.'
			]
		}
	];

	const jumpLinks: NavLink[] = [
		...sections.map((s) => ({ label: s.title, href: `#${s.id}` })),
		{
			icon: Github,
			iconSize: 'lg' as const,
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/sites/landing-sections',
			testId: 'nav-github'
		}
	];
</script>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>

<svelte:head>
	<title>Landing Sections - cleanroom</title>
	<meta name="description" content="Landing page with sections example from cleanroom" />
</svelte:head>

<div class="min-h-dvh flex flex-col">
	<Nav siteName="Landing Sections" logo="🦫" links={jumpLinks} maxWidth="max-w-6xl" />
	<BackLink href="/" label="Back to cleanroom" maxWidth="max-w-6xl" />

	<main class="flex-1">
		<FloatingHero
			title="Landing Sections"
			logo="🦫"
			description="A landing page with jump-link navigation to scroll between sections."
			inline
		/>

		<StripedSections {sections} />
	</main>

	<Footer siteName="Landing Sections" centered />
</div>
