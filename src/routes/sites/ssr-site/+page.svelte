<script lang="ts">
	import { FloatingHero, Features, CTA } from '$lib/components/blocks';
	import type { Feature } from '$lib/components/blocks';

	const features: Feature[] = [
		{
			icon: '🔐',
			title: 'Auth Ready',
			description: 'Server-side rendering enables secure session handling, making it the perfect base for authentication.'
		},
		{
			icon: '⚡',
			title: 'Dynamic Content',
			description: 'Fetch fresh data on every request. Perfect for dashboards, user profiles, and real-time content.'
		},
		{
			icon: '🛡️',
			title: 'Secure by Default',
			description: 'Server-side code stays on the server. API keys and sensitive logic never reach the client.'
		}
	];
</script>

<svelte:head>
	<title>SSR Site - cleanroom</title>
	<meta name="description" content="A multi-page SSR site example from cleanroom" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-16">
	<FloatingHero
		title="SSR Site"
		logo="🚀"
		description="A multi-page server-side rendered site with responsive navigation and smooth page transitions. Unlike the Static Site, pages are rendered on each request—ideal for authenticated content, user dashboards, or dynamic data."
		descriptionWidth="max-w-2xl"
		inline
	>
		<a href="/sites/ssr-site/about" class="btn btn-dark">Learn More</a>
		<a href="/sites/ssr-site/contact" class="btn btn-light">Get in Touch</a>
	</FloatingHero>

	<Features title="Why SSR?" {features} />

	<CTA
		title="Ready to Build?"
		description="This template is designed to be extended with authentication, database connections, and protected routes."
	>
		<a href="/sites/ssr-site/services" class="btn btn-dark">View Our Services</a>
	</CTA>
</div>
