<script lang="ts">
	import { SimpleHero, SimpleNav } from '$lib/components/blocks';
</script>

<svelte:head>
	<title>Blocks - Cleanroom</title>
	<meta name="description" content="Cleanroom Block Components" />
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
				projectName="My App"
				logoEmoji="🚀"
				links={[
					{ href: '#', label: 'Home' },
					{ href: '#', label: 'About' },
					{ href: '#', label: 'Contact' }
				]}
			/>
		</div>
	</section>

	<!-- SimpleHero -->
	<section class="mb-12">
		<h2>SimpleHero</h2>
		<p class="text-zinc-600 mb-4">A centered hero section with logo and project name.</p>
		<div class="border rounded-xl overflow-hidden bg-white">
			<SimpleHero projectName="My Awesome App" logoEmoji="✨" />
		</div>
	</section>

	<!-- AuthNav -->
	<section class="mb-12">
		<h2>AuthNav</h2>
		<p class="text-zinc-600 mb-4">
			The navigation bar you see at the top of this site. Includes authentication state handling,
			mobile responsive menu, and avatar dropdown.
		</p>
		<div class="text-sm text-zinc-500 bg-zinc-50 rounded-lg p-4">
			<code>AuthNav</code> is already rendered in the root layout. See the navigation above for a live
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
			<code>AvatarMenu</code> is used within <code>AuthNav</code> when a user is logged in. Sign in to
			see it in action.
		</div>
	</section>

	<!-- Usage -->
	<section class="mb-12">
		<h2>Usage</h2>
		<p class="text-zinc-600 mb-4">Import blocks from the blocks module:</p>
		<pre
			class="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm overflow-x-auto"><code>{`import { SimpleHero, SimpleNav, AuthNav, AvatarMenu } from '$lib/components/blocks';

// SimpleNav
<SimpleNav
  projectName="My App"
  logoEmoji="🚀"
  links={[
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' }
  ]}
/>

// SimpleHero
<SimpleHero projectName="My App" logoEmoji="✨" />

// AuthNav (typically in root layout)
<AuthNav user={data.user} />`}</code></pre>
	</section>
</div>
