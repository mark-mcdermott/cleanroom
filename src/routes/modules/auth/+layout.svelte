<script lang="ts">
	import { page } from '$app/stores';
	import { Nav, BackLink, Footer } from '$lib/components/blocks';
	import type { NavLink, AvatarConfig } from '$lib/components/blocks';
	import { Sonner } from '$lib/components/ui';
	import { Github, LogOut } from 'lucide-svelte';

	let { children, data } = $props();

	const navLinks: NavLink[] = [
		{ href: '/modules/auth', label: 'Home' },
		{ href: '/modules/auth/about', label: 'About' },
		{ href: '/modules/auth/admin/users', label: 'The Office', requiresAuth: true, requiresAdmin: true, testId: 'nav-the-office' },
		{ href: '/modules/auth/contact', label: 'Contact' },
		{ href: '/modules/auth/private', label: 'Private', requiresAuth: true, testId: 'nav-private' },
		{ href: '/modules/auth/login', label: 'Log In', hideWhenAuth: true, testId: 'nav-login' },
		{ href: '/modules/auth/signup', label: 'Sign Up', hideWhenAuth: true, testId: 'nav-signup' },
		{
			icon: Github,
			iconSize: 'lg',
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/modules/auth',
			testId: 'nav-github'
		}
	];

	const avatarConfig: AvatarConfig = {
		show: true,
		links: [
			{
				label: 'Log Out',
				icon: LogOut,
				action: '/modules/auth/logout',
				testId: 'nav-logout'
			}
		]
	};
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

<Sonner.Toaster richColors />
<div class="min-h-dvh flex flex-col bg-background">
	<Nav
		siteName="auth-app"
		logo="🔐"
		links={navLinks}
		maxWidth="max-w-6xl"
		user={data.user}
		isAdmin={data.user?.admin}
		avatar={avatarConfig}
	/>
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
			<a href={link.href} class="hover:text-foreground transition-colors">
				{link.label}
			</a>
		{/each}
	</Footer>
</div>
