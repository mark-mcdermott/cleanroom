<script lang="ts">
	import { Hero, SimpleNav } from '$lib/components/blocks';
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
					{ href: '#', label: 'Home' },
					{ href: '#', label: 'About' },
					{ href: '#', label: 'Contact' }
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
				title="My Awesome App"
				logo="✨"
				tagline="Build Something Great"
				showFlame={true}
				description="A short description of your amazing project."
			>
				<a href="#" class="btn btn-dark">Get Started</a>
				<a href="#" class="btn btn-light">Learn More</a>
			</Hero>
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

	<!-- Usage -->
	<section class="mb-12">
		<h2>Usage</h2>
		<p class="text-zinc-600 mb-4">Import blocks from the blocks module:</p>
		<pre
			class="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm overflow-x-auto"><code>{`import { Hero, SimpleNav, Nav, AvatarMenu } from '$lib/components/blocks';

// SimpleNav (logo can be emoji, image path, or use logoIcon snippet for icons/SVGs)
<SimpleNav
  siteName="My App"
  logo="🚀"
  links={[
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' }
  ]}
/>

// Hero (logo can be emoji, image path, or use logoIcon snippet for icons/SVGs)
<Hero
  title="My App"
  logo="✨"
  tagline="Your tagline here"
  showFlame={true}
  description="A short description"
>
  <a href="/start" class="btn btn-dark">Get Started</a>
</Hero>

// Hero with image above title
<Hero
  title="My App"
  image="/header-image.png"
  logo="🚀"
/>

// Nav (typically in root layout)
<Nav user={data.user} />`}</code></pre>
	</section>
</div>
