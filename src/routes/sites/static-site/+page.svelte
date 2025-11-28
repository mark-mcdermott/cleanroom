<svelte:head>
	<title>Static Site - cleanroom</title>
	<meta name="description" content="A multi-page static site example from cleanroom" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<!-- Hero -->
	<section class="text-center mb-20">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3 mb-6">
			<span class="text-5xl sm:text-6xl">🦫</span>
			Static Site
		</h1>
		<p class="text-zinc-600 text-lg max-w-2xl mx-auto mb-8">
			A multi-page static site with responsive navigation, smooth page transitions, and multiple content pages. Perfect for portfolios, documentation, or small business websites. SPA-like feel (no page refreshes), but just prerendered (no SSR/SPA).
		</p>
		<div class="flex gap-4 justify-center flex-wrap">
			<a
				href="/sites/static-site/about"
				class="px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
			>
				Learn More
			</a>
			<a
				href="/sites/static-site/contact"
				class="px-6 py-3 border border-zinc-300 rounded-lg hover:border-zinc-400 transition-colors"
			>
				Get in Touch
			</a>
		</div>
	</section>

	<!-- Features -->
	<section class="mb-20">
		<h2 class="text-2xl font-semibold mt-0 mb-8 text-center">What's Included</h2>
		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center p-6">
				<div class="text-4xl mb-4">🎨</div>
				<h3 class="font-semibold mb-2">Responsive Design</h3>
				<p class="text-zinc-600 text-sm">
					Looks great on all devices with mobile-first breakpoints and a collapsible navigation menu.
				</p>
			</div>
			<div class="text-center p-6">
				<div class="text-4xl mb-4">✨</div>
				<h3 class="font-semibold mb-2">Smooth Transitions</h3>
				<p class="text-zinc-600 text-sm">
					Page content fades and slides in for a polished, app-like feel without jarring jumps.
				</p>
			</div>
			<div class="text-center p-6">
				<div class="text-4xl mb-4">📄</div>
				<h3 class="font-semibold mb-2">Multiple Pages</h3>
				<p class="text-zinc-600 text-sm">
					Includes Home, About, Services, and Contact pages with unique content on each.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="bg-zinc-50 rounded-2xl p-8 text-center">
		<h2 class="text-2xl font-semibold mt-0 mb-4">Ready to Explore?</h2>
		<p class="text-zinc-600 mb-6">
			Navigate through the pages using the menu above to see how a complete static site works.
		</p>
		<a
			href="/sites/static-site/services"
			class="inline-block px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
		>
			View Our Services
		</a>
	</section>
</div>
