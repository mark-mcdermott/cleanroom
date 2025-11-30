<script lang="ts">
	import { page } from '$app/stores';
	import { Nav, BackLink, Footer } from '$lib/components/blocks';
	import type { NavLink } from '$lib/components/blocks';
	import { Github } from 'lucide-svelte';

	let { children } = $props();

	const navLinks: NavLink[] = [
		{ href: '/sites/static-site', label: 'Home' },
		{ href: '/sites/static-site/about', label: 'About' },
		{ href: '/sites/static-site/services', label: 'Services' },
		{ href: '/sites/static-site/contact', label: 'Contact' },
		{
			icon: Github,
			iconSize: 'lg',
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/sites/static-site',
			testId: 'nav-github'
		}
	];
</script>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	.page-transition {
		animation: fadeIn 200ms ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>

<div class="min-h-dvh flex flex-col bg-background">
	<Nav siteName="Static Site" logo="🦫" links={navLinks} maxWidth="max-w-6xl" showThemeToggle />
	<BackLink href="/" label="Back to cleanroom" maxWidth="max-w-6xl" />

	<!-- Page content with transition -->
	<main class="flex-1">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer siteName="Static Site" logo="🦫" maxWidth="max-w-6xl">
		{#each navLinks as link}
			<a href={link.href} class="hover:text-foreground transition-colors">
				{link.label}
			</a>
		{/each}
	</Footer>
</div>
