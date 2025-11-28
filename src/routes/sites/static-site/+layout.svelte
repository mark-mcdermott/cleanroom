<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft, Menu, X } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/sites/static-site', label: 'Home' },
		{ href: '/sites/static-site/about', label: 'About' },
		{ href: '/sites/static-site/services', label: 'Services' },
		{ href: '/sites/static-site/contact', label: 'Contact' }
	];

	const isActive = (href: string) => {
		if (href === '/sites/static-site') {
			return $page.url.pathname === '/sites/static-site';
		}
		return $page.url.pathname.startsWith(href);
	};
</script>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>

<div class="min-h-dvh flex flex-col bg-white">
	<!-- Navigation -->
	<nav class="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-50">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<div>
				<a href="/sites/static-site" class="flex items-center gap-2 text-xl no-underline">
					<span>🦫</span>
					<span class="font-semibold tracking-tight">Static Site</span>
				</a>
				<a
					href="/"
					class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 mt-1"
				>
					<ArrowLeft class="w-3 h-3" />
					Back to Cleanroom
				</a>
			</div>

			<!-- Desktop nav -->
			<div class="hidden md:flex gap-6">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm transition-colors {isActive(link.href)
							? 'text-zinc-900 font-medium'
							: 'text-zinc-600 hover:text-zinc-900'}"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Mobile menu button -->
			<button
				class="md:hidden p-2"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<X class="w-6 h-6" />
				{:else}
					<Menu class="w-6 h-6" />
				{/if}
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t bg-white" transition:fade={{ duration: 150 }}>
				<div class="px-6 py-4 flex flex-col gap-4">
					{#each navLinks as link}
						<a
							href={link.href}
							class="text-sm transition-colors {isActive(link.href)
								? 'text-zinc-900 font-medium'
								: 'text-zinc-600 hover:text-zinc-900'}"
							onclick={() => (mobileMenuOpen = false)}
						>
							{link.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>

	<!-- Page content with transition -->
	<main class="flex-1">
		{#key $page.url.pathname}
			<div
				in:fly={{ x: 20, duration: 300, delay: 150 }}
				out:fade={{ duration: 150 }}
			>
				{@render children()}
			</div>
		{/key}
	</main>

	<footer class="border-t py-8 mt-auto">
		<div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
			<div class="flex items-center gap-2">
				<span>🦫</span>
				<span>&copy; {new Date().getFullYear()} Static Site</span>
			</div>
			<div class="flex gap-6">
				{#each navLinks as link}
					<a href={link.href} class="hover:text-zinc-700 transition-colors">
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	</footer>
</div>
