<script lang="ts">
	import { Story, Team, CalloutGrid } from '$lib/components/blocks';
	import type { TeamMember, CalloutGridItem } from '$lib/components/blocks';

	const storyParagraphs = [
		'It all started in a cozy burrow beneath the eucalyptus trees. Willy Wombat had a vision: to create websites that were as sturdy and well-crafted as the tunnels he dug. After years of perfecting his craft underground, he emerged with a revolutionary approach to web development.',
		'"Why should building a website be complicated?" Willy asked himself one moonlit night. "A good burrow is simple, functional, and lasts for generations. Websites should be the same."',
		'Today, SSR Site carries on that philosophy. We believe in building things that work, look great, and don\'t require constant maintenance. Just like a well-dug burrow, our sites stand the test of time.'
	];

	const teamMembers: TeamMember[] = [
		{
			icon: '🦫',
			name: 'Willy Wombat',
			role: 'Founder & Lead Developer',
			bio: 'Master tunnel architect turned web developer. Believes every project deserves a solid foundation.'
		},
		{
			icon: '🦜',
			name: 'Captain Feathers',
			role: 'Creative Director',
			bio: 'Former aerial cartographer with an eye for design. Sees the big picture from any angle.'
		},
		{
			icon: '🐾',
			name: 'Digger Dan',
			role: 'Infrastructure Lead',
			bio: 'When things get complex, Dan digs in. Literally. No problem too deep to solve.'
		}
	];

	const values: CalloutGridItem[] = [
		{
			icon: '🏗️',
			title: 'Build to Last',
			description: 'We create websites that stand the test of time, not trendy solutions that crumble.'
		},
		{
			icon: '🎯',
			title: 'Keep It Simple',
			description: 'Complexity is the enemy of reliability. We strip away the unnecessary.'
		},
		{
			icon: '🤝',
			title: 'Work Together',
			description: "The best results come from collaboration. We're partners, not vendors."
		},
		{
			icon: '🌱',
			title: 'Grow Sustainably',
			description: "Fast growth means nothing if you can't maintain it. We build for the long term."
		}
	];
</script>

<svelte:head>
	<title>About - SSR Site</title>
	<meta name="description" content="Learn about Willy Wombat and the SSR Site team" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight mb-8">About Us</h1>

	<Story title="Our Story" paragraphs={storyParagraphs} />

	<Team title="The Team" members={teamMembers} />

	<CalloutGrid title="Our Values" items={values} />
</div>
