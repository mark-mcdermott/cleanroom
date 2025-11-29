<script lang="ts">
	import { page } from '$app/stores';
	import { Nav, BackLink, Footer } from '$lib/components/blocks';
	import type { NavLink } from '$lib/components/blocks';
	import { ViewToggle } from '$lib/components/ui';
	import type { ToggleOption } from '$lib/components/ui/view-toggle/ViewToggle.svelte';
	import { Github, ShoppingBag, Settings, ShoppingCart } from 'lucide-svelte';

	let { children } = $props();

	const navLinks: NavLink[] = [
		{ href: '/modules/store', label: 'Shop' },
		{ href: '/modules/store/cart', label: 'Cart', icon: ShoppingCart },
		{
			icon: Github,
			iconSize: 'lg',
			href: 'https://github.com/mark-mcdermott/cleanroom/tree/main/src/routes/modules/store',
			testId: 'nav-github'
		}
	];

	const viewOptions: [ToggleOption, ToggleOption] = [
		{ label: 'Shop', href: '/modules/store', icon: ShoppingBag },
		{ label: 'Admin', href: '/modules/store/admin', icon: Settings }
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
	<Nav siteName="Store" logo="🛍️" links={navLinks} maxWidth="max-w-5xl" showThemeToggle />
	<div class="max-w-5xl mx-auto px-6 w-full">
		<div class="flex items-center justify-between py-3 border-b border-border">
			<ViewToggle.Root options={viewOptions} activeHref={$page.url.pathname} />
		</div>
	</div>
	<BackLink href="/" label="Back to cleanroom" maxWidth="max-w-5xl" />

	<main class="flex-1">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>

	<Footer siteName="Store" logo="🛍️" maxWidth="max-w-5xl" centered />
</div>
