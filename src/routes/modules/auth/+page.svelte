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
	<title>auth-app - cleanroom</title>
	<meta name="description" content="An SSR site with authentication module from cleanroom" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-16">
	<FloatingHero
		title="auth-app"
		logo="🔐"
		description="A multi-page server-side rendered site with responsive navigation and smooth page transitions. Unlike static sites, pages are rendered on each request—ideal for authenticated content, user dashboards, or dynamic data."
		descriptionWidth="max-w-2xl"
		inline
	/>

	<!-- Modules Added -->
	<div class="py-8 text-center">
		<h2 class="text-xl font-semibold mb-6">Modules Added</h2>
		<div class="space-y-4">
			<div class="flex gap-4 items-center justify-center">
				<div class="text-2xl">🔐</div>
				<h3 class="font-medium">Authentication</h3>
			</div>
		</div>
	</div>

	<Features title="Why SSR?" {features} />

	<CTA
		title="Ready to Build?"
		description="This template is designed to be extended with authentication, database connections, and protected routes."
	>
		<a href="/modules/auth/services" class="btn btn-dark">View Our Services</a>
	</CTA>
</div>
