<script lang="ts">
	import {
		Hero,
		FloatingHero,
		SimpleNav,
		Footer,
		BackLink,
		StripedSections,
		Features,
		CTA,
		Story,
		Team,
		CalloutGrid,
		Blurb,
		Services,
		CalloutNumbered,
		EmojiList,
		CalloutFAQ
	} from '$lib/components/blocks';
	import type {
		Section,
		Feature,
		TeamMember,
		CalloutGridItem,
		ServiceItem,
		CalloutNumberedItem,
		EmojiListItem,
		FAQItem
	} from '$lib/components/blocks';

	const sampleSections: Section[] = [
		{ id: 'section-1', title: 'Section One', content: 'This is the first section content.' },
		{ id: 'section-2', title: 'Section Two', content: 'This is the second section content.' }
	];

	const sampleFeatures: Feature[] = [
		{ icon: '🚀', title: 'Fast', description: 'Lightning fast performance' },
		{ icon: '🔒', title: 'Secure', description: 'Built with security in mind' },
		{ icon: '🎨', title: 'Beautiful', description: 'Stunning UI out of the box' }
	];

	const sampleTeam: TeamMember[] = [
		{ icon: '👩‍💻', name: 'Alice', role: 'Developer', bio: 'Full-stack engineer' },
		{ icon: '👨‍🎨', name: 'Bob', role: 'Designer', bio: 'UI/UX specialist' }
	];

	const sampleCalloutItems: CalloutGridItem[] = [
		{ icon: '✨', title: 'Feature One', description: 'Description of feature one' },
		{ icon: '🎯', title: 'Feature Two', description: 'Description of feature two' }
	];

	const sampleServices: ServiceItem[] = [
		{
			icon: '🏠',
			title: 'Web Development',
			description: 'Custom websites built to your needs.',
			features: ['Responsive design', 'SEO optimized', 'Fast loading']
		}
	];

	const sampleProcess: CalloutNumberedItem[] = [
		{ title: 'Plan', description: 'Define the scope' },
		{ title: 'Build', description: 'Develop the solution' },
		{ title: 'Launch', description: 'Deploy to production' }
	];

	const sampleEmojiList: EmojiListItem[] = [
		{ icon: '📧', title: 'Email', description: 'hello@example.com' },
		{ icon: '📍', title: 'Location', description: 'San Francisco, CA' }
	];

	const sampleFAQ: FAQItem[] = [
		{ question: 'How does it work?', answer: 'It just works!' },
		{ question: 'Is it free?', answer: 'Yes, open source.' }
	];
</script>

<svelte:head>
	<title>Blocks - cleanroom</title>
	<meta name="description" content="cleanroom Block Components" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<h1 class="mb-2">Blocks</h1>
	<p class="text-zinc-600 text-lg mb-12">
		Pre-built, composable sections for building pages quickly.
	</p>

	<!-- SimpleNav -->
	<section class="mb-12">
		<h2>SimpleNav</h2>
		<p class="text-zinc-600 mb-4">A simple navigation bar with logo and links.</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<SimpleNav
				siteName="My App"
				logo="🚀"
				links={[
					{ href: '/blocks', label: 'Home' },
					{ href: '/blocks', label: 'About' },
					{ href: '/blocks', label: 'Contact' }
				]}
			/>
		</div>
	</section>

	<!-- Hero -->
	<section class="mb-12">
		<h2>Hero</h2>
		<p class="text-zinc-600 mb-4">
			A centered hero section with title and (optional) logo, tagline, description, and CTA buttons.
		</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<Hero
				title="My App"
				logo="✨"
				tagline="Build Something Great"
				showFlame={true}
				description="A short description of your amazing project."
			>
				<a href="/blocks" class="btn btn-dark">Get Started</a>
				<a href="/blocks" class="btn btn-light">Learn More</a>
			</Hero>
		</div>
	</section>

	<!-- FloatingHero -->
	<section class="mb-12">
		<h2>FloatingHero</h2>
		<p class="text-zinc-600 mb-4">A hero with floating/gradient background effect.</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<FloatingHero title="Floating Hero" description="A hero with a subtle floating effect." />
		</div>
	</section>

	<!-- Footer -->
	<section class="mb-12">
		<h2>Footer</h2>
		<p class="text-zinc-600 mb-4">A simple footer with copyright and optional links.</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<Footer siteName="My App" logo="🚀">
				<a href="/blocks" class="hover:text-zinc-900">Privacy</a>
				<a href="/blocks" class="hover:text-zinc-900">Terms</a>
			</Footer>
		</div>
	</section>

	<!-- BackLink -->
	<section class="mb-12">
		<h2>BackLink</h2>
		<p class="text-zinc-600 mb-4">A back navigation link with arrow icon.</p>
		<div class="border rounded-xl p-4 bg-white">
			<BackLink href="/blocks" label="Back to Blocks" />
		</div>
	</section>

	<!-- Blurb -->
	<section class="mb-12">
		<h2>Blurb</h2>
		<p class="text-zinc-600 mb-4">A page title with description intro.</p>
		<div class="border rounded-xl p-6 bg-white">
			<Blurb title="Page Title" description="A brief description of what this page is about." />
		</div>
	</section>

	<!-- Story -->
	<section class="mb-12">
		<h2>Story</h2>
		<p class="text-zinc-600 mb-4">A narrative section with multiple paragraphs.</p>
		<div class="border rounded-xl p-6 bg-white">
			<Story
				title="Our Story"
				paragraphs={[
					'This is the first paragraph of our story.',
					'And this is the second paragraph with more details.'
				]}
			/>
		</div>
	</section>

	<!-- StripedSections -->
	<section class="mb-12">
		<h2>StripedSections</h2>
		<p class="text-zinc-600 mb-4">Alternating background sections.</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<StripedSections sections={sampleSections} />
		</div>
	</section>

	<!-- Features -->
	<section class="mb-12">
		<h2>Features</h2>
		<p class="text-zinc-600 mb-4">A grid of feature cards with icons.</p>
		<div class="border rounded-xl p-6 bg-white">
			<Features features={sampleFeatures} />
		</div>
	</section>

	<!-- CTA -->
	<section class="mb-12">
		<h2>CTA</h2>
		<p class="text-zinc-600 mb-4">A call-to-action section.</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<CTA title="Ready to get started?" description="Join thousands of happy customers today.">
				<a href="/blocks" class="btn btn-dark">Get Started</a>
			</CTA>
		</div>
	</section>

	<!-- Team -->
	<section class="mb-12">
		<h2>Team</h2>
		<p class="text-zinc-600 mb-4">A team member grid with icons, names, roles, and bios.</p>
		<div class="border rounded-xl p-6 bg-white">
			<Team title="Meet the Team" members={sampleTeam} columns={2} />
		</div>
	</section>

	<!-- CalloutGrid -->
	<section class="mb-12">
		<h2>CalloutGrid</h2>
		<p class="text-zinc-600 mb-4">A grid of callout items with icons.</p>
		<div class="border rounded-xl p-6 bg-white">
			<CalloutGrid title="Our Values" items={sampleCalloutItems} />
		</div>
	</section>

	<!-- Services -->
	<section class="mb-12">
		<h2>Services</h2>
		<p class="text-zinc-600 mb-4">Service cards with icons, descriptions, and feature lists.</p>
		<div class="border rounded-xl p-6 bg-white">
			<Services services={sampleServices} />
		</div>
	</section>

	<!-- CalloutNumbered -->
	<section class="mb-12">
		<h2>CalloutNumbered</h2>
		<p class="text-zinc-600 mb-4">Numbered steps in a callout section.</p>
		<div class="border rounded-xl p-6 bg-white">
			<CalloutNumbered title="How It Works" items={sampleProcess} columns={3} />
		</div>
	</section>

	<!-- EmojiList -->
	<section class="mb-12">
		<h2>EmojiList</h2>
		<p class="text-zinc-600 mb-4">A list with emoji icons, titles, and descriptions.</p>
		<div class="border rounded-xl p-6 bg-white">
			<EmojiList title="Contact Info" items={sampleEmojiList} />
		</div>
	</section>

	<!-- CalloutFAQ -->
	<section class="mb-12">
		<h2>CalloutFAQ</h2>
		<p class="text-zinc-600 mb-4">A FAQ section with questions and answers.</p>
		<div class="border rounded-xl p-6 bg-white">
			<CalloutFAQ title="FAQ" items={sampleFAQ} />
		</div>
	</section>

	<!-- Nav -->
	<section class="mb-12">
		<h2>Nav</h2>
		<p class="text-zinc-600 mb-4">
			The navigation bar you see at the top of this site. Includes authentication state handling,
			mobile responsive menu, and avatar dropdown.
		</p>
		<div class="text-sm text-zinc-500 bg-zinc-50 rounded-lg p-4">
			<code>Nav</code> is already rendered in the root layout. See the navigation above for a live
			example.
		</div>
	</section>

	<!-- AvatarMenu -->
	<section class="mb-12">
		<h2>AvatarMenu</h2>
		<p class="text-zinc-600 mb-4">
			A dropdown menu triggered by a user avatar, typically used for account actions.
		</p>
		<div class="text-sm text-zinc-500 bg-zinc-50 rounded-lg p-4">
			<code>AvatarMenu</code> is used within <code>Nav</code> when a user is logged in. Sign in to
			see it in action.
		</div>
	</section>
</div>
