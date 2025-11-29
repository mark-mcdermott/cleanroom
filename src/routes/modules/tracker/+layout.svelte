<script lang="ts">
	import { page } from '$app/stores';
	import { Nav, BackLink, Footer } from '$lib/components/blocks';
	import type { NavLink } from '$lib/components/blocks';
	import { ViewToggle } from '$lib/components/ui';
	import type { ToggleOption } from '$lib/components/ui/view-toggle/ViewToggle.svelte';
	import { Github, LayoutDashboard, Settings, History, PlusCircle } from 'lucide-svelte';

	let { children } = $props();

	const navLinks: NavLink[] = [
		{ href: '/modules/tracker', label: 'Dashboard' },
		{ href: '/modules/tracker/log', label: 'Log Entry', icon: PlusCircle },
		{ href: '/modules/tracker/history', label: 'History', icon: History },
		{
			icon: Github,
			iconSize: 'lg',
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/modules/tracker',
			testId: 'nav-github'
		}
	];

	const viewOptions: [ToggleOption, ToggleOption] = [
		{ label: 'Dashboard', href: '/modules/tracker', icon: LayoutDashboard },
		{ label: 'Admin', href: '/modules/tracker/admin', icon: Settings }
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
	<Nav siteName="Tracker" logo="📊" links={navLinks} maxWidth="max-w-4xl" showThemeToggle />
	<div class="max-w-4xl mx-auto px-6 w-full">
		<div class="flex items-center justify-between py-3 border-b border-border">
			<ViewToggle.Root options={viewOptions} activeHref={$page.url.pathname} />
		</div>
	</div>
	<BackLink href="/" label="Back to cleanroom" maxWidth="max-w-4xl" />

	<main class="flex-1">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer siteName="Tracker" logo="📊" maxWidth="max-w-4xl" centered />
</div>
