<script lang="ts">
	import { page } from '$app/stores';
	import { Nav, BackLink, Footer } from '$lib/components/blocks';
	import type { NavLink } from '$lib/components/blocks';
	import { Github } from 'lucide-svelte';

	let { children } = $props();

	const navLinks: NavLink[] = [
		{ href: '/modules/auth', label: 'Home' },
		{ href: '/modules/auth/about', label: 'About' },
		{ href: '/modules/auth/services', label: 'Services' },
		{ href: '/modules/auth/contact', label: 'Contact' },
		{
			icon: Github,
			iconSize: 'lg',
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/modules/auth',
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

<div class="min-h-dvh flex flex-col bg-white">
	<Nav siteName="auth-app" logo="🔐" links={navLinks} maxWidth="max-w-6xl" />
	<BackLink href="/" label="Back to cleanroom" maxWidth="max-w-6xl" />

	<!-- Page content with transition -->
	<main class="flex-1">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer siteName="auth-app" logo="🔐" maxWidth="max-w-6xl">
		{#each navLinks.filter(l => l.label) as link}
			<a href={link.href} class="hover:text-zinc-700 transition-colors">
				{link.label}
			</a>
		{/each}
	</Footer>
</div>
