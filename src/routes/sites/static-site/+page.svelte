<script lang="ts">
	import { FloatingHero, Features, CTA } from '$lib/components/blocks';
	import type { Feature } from '$lib/components/blocks';

	const features: Feature[] = [
		{
			icon: '🎨',
			title: 'Responsive Design',
			description: 'Looks great on all devices with mobile-first breakpoints and a collapsible navigation menu.'
		},
		{
			icon: '✨',
			title: 'Smooth Transitions',
			description: 'Page content fades and slides in for a polished, app-like feel without jarring jumps.'
		},
		{
			icon: '📄',
			title: 'Multiple Pages',
			description: 'Includes Home, About, Services, and Contact pages with unique content on each.'
		}
	];
</script>

<svelte:head>
	<title>Static Site - cleanroom</title>
	<meta name="description" content="A multi-page static site example from cleanroom" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-16">
	<FloatingHero
		title="Static Site"
		logo="🦫"
		description="A multi-page static site with responsive navigation, smooth page transitions, and multiple content pages. Perfect for portfolios or small business websites. SPA-like feel (no page refreshes), but just prerendered (no SSR/SPA)."
		descriptionWidth="max-w-2xl"
		inline
	>
		<a href="/sites/static-site/about" class="btn btn-dark">Learn More</a>
		<a href="/sites/static-site/contact" class="btn btn-light">Get in Touch</a>
	</FloatingHero>

	<Features title="What's Included" {features} />

	<CTA
		title="Ready to Explore?"
		description="Navigate through the pages using the menu above to see how a complete static site works."
	>
		<a href="/sites/static-site/services" class="btn btn-dark">View Our Services</a>
	</CTA>
</div>
