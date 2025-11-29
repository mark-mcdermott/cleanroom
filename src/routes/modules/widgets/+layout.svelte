<script lang="ts">
	import { page } from '$app/stores';
	import { Nav, BackLink, Footer } from '$lib/components/blocks';
	import type { NavLink, AvatarConfig } from '$lib/components/blocks';
	import { Sonner } from '$lib/components/ui';
	import { Github, LogOut, Shield, User } from 'lucide-svelte';

	let { children, data } = $props();

	const navLinks: NavLink[] = [
		{ href: '/modules/widgets', label: 'Home' },
		{ href: '/modules/widgets/admin', label: 'Admin', requiresAuth: true, requiresAdmin: true, testId: 'nav-admin' },
		{
			icon: Github,
			iconSize: 'lg',
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/modules/widgets',
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
<div class="min-h-dvh flex flex-col bg-white">
	<Nav
		siteName="widgets-demo"
		logo="🧩"
		links={navLinks}
		maxWidth="max-w-6xl"
		user={data.user}
		isAdmin={data.user?.admin}
		avatar={avatarConfig}
	/>
	<BackLink href="/" label="Back to cleanroom" maxWidth="max-w-6xl" />

	{#if data.user?.admin}
		<div class="max-w-6xl mx-auto w-full px-6 mt-4">
			<div class="flex items-center gap-2 text-sm">
				<span class="text-zinc-500">View mode:</span>
				<a
					href={$page.url.pathname.replace('/admin', '')}
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors {!data.isAdminView ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}"
				>
					<User class="w-3.5 h-3.5" />
					User
				</a>
				<a
					href="/modules/widgets/admin"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors {data.isAdminView ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}"
				>
					<Shield class="w-3.5 h-3.5" />
					Admin
				</a>
			</div>
		</div>
	{/if}

	<main class="flex-1">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer siteName="widgets-demo" logo="🧩" maxWidth="max-w-6xl">
		{#each navLinks.filter(l => l.label) as link}
			<a href={link.href} class="hover:text-zinc-700 transition-colors">
				{link.label}
			</a>
		{/each}
	</Footer>
</div>
