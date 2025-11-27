<script lang="ts">
	import { Button, Sheet, DropdownMenu } from '$lib/components/ui';
	import { Menu, ChevronDown } from 'lucide-svelte';
	import AvatarMenu from './AvatarMenu.svelte';

	interface NavLink {
		href: string;
		label: string;
		testId?: string;
	}

	interface Props {
		user?: { id: string; email: string; name?: string | null } | null;
		isAdmin?: boolean;
		galleryLinks?: NavLink[];
		publicAuthLinks?: NavLink[];
		adminLinks?: NavLink[];
	}

	let {
		user = null,
		isAdmin = false,
		galleryLinks = [
			{ href: '/components', label: 'components', testId: 'nav-components' },
			{ href: '/blocks', label: 'blocks', testId: 'nav-blocks' }
		],
		publicAuthLinks = [
			{ href: '/login', label: 'login', testId: 'nav-login' },
			{ href: '/signup', label: 'signup', testId: 'nav-signup' }
		],
		adminLinks = [{ href: '/admin', label: 'admin', testId: 'nav-admin' }]
	}: Props = $props();

	let mobileMenuOpen = $state(false);
	let sitesExpanded = $state(false);

	const isLoggedIn = $derived(!!user);
	const userEmail = $derived(user?.email || '');

	const siteLinks = [
		{ href: '/sites/demo', label: 'demo', testId: 'nav-sites-demo' },
		{ href: '/sites/landing-simple', label: 'landing (no nav)', testId: 'nav-sites-landing-simple' },
		{
			href: '/sites/landing-sections',
			label: 'landing (jump links)',
			testId: 'nav-sites-landing-sections'
		}
	];
</script>

<nav data-testid="nav" class="w-full flex items-center justify-between px-8 py-6">
	<!-- Logo -->
	<a
		href="/"
		data-testid="nav-logo"
		class="flex items-center gap-2 no-underline hover:no-underline cursor-pointer"
	>
		<img src="/logo.png" alt="Cleanroom" class="w-8 h-8" />
		<span class="font-semibold text-lg tracking-tight">cleanroom</span>
	</a>

	<!-- Desktop Navigation - hidden on mobile -->
	<div class="hidden md:flex gap-6 items-center">
		<!-- Gallery links - always visible -->
		{#each galleryLinks as link}
			<a
				href={link.href}
				data-testid={link.testId}
				class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
			>
				{link.label}
			</a>
		{/each}

		<!-- Sites dropdown -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<button
					data-testid="nav-sites"
					class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1"
				>
					sites
					<ChevronDown class="h-3 w-3" />
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each siteLinks as link}
					<DropdownMenu.Item>
						<a
							href={link.href}
							data-testid={link.testId}
							class="flex items-center w-full cursor-pointer"
						>
							{link.label}
						</a>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<!-- Auth state navigation -->
		{#if !isLoggedIn}
			<!-- Public auth links -->
			{#each publicAuthLinks as link}
				<a
					href={link.href}
					data-testid={link.testId}
					class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
				>
					{link.label}
				</a>
			{/each}
		{:else}
			<!-- Admin link (only for admins) -->
			{#if isAdmin}
				{#each adminLinks as link}
					<a
						href={link.href}
						data-testid={link.testId}
						class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
					>
						{link.label}
					</a>
				{/each}
			{/if}

			<!-- Avatar Menu -->
			<AvatarMenu userEmail={userEmail} userId={user?.id} />
		{/if}
	</div>

	<!-- Mobile Hamburger - hidden on desktop -->
	<Button.Root
		variant="ghost"
		size="icon"
		class="md:hidden"
		data-testid="nav-mobile-toggle"
		onclick={() => (mobileMenuOpen = true)}
		aria-label="Open navigation menu"
	>
		<Menu class="h-6 w-6" />
	</Button.Root>

	<!-- Mobile Sheet -->
	<Sheet.Root bind:open={mobileMenuOpen}>
		<Sheet.Content side="left" data-testid="nav-mobile-drawer">
			<Sheet.Header>
				<Sheet.Title>Cleanroom</Sheet.Title>
			</Sheet.Header>
			<div class="flex flex-col gap-4 mt-6 px-4">
				<!-- Gallery links - always visible -->
				{#each galleryLinks as link}
					<a
						href={link.href}
						data-testid={link.testId}
						class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
						onclick={() => (mobileMenuOpen = false)}
					>
						{link.label}
					</a>
				{/each}

				<!-- Sites expandable section -->
				<div>
					<button
						class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1 w-full"
						onclick={() => (sitesExpanded = !sitesExpanded)}
					>
						sites
						<ChevronDown class="h-3 w-3 transition-transform {sitesExpanded ? 'rotate-180' : ''}" />
					</button>
					{#if sitesExpanded}
						<div class="ml-4 mt-2 flex flex-col gap-2">
							{#each siteLinks as link}
								<a
									href={link.href}
									data-testid={link.testId}
									class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
									onclick={() => (mobileMenuOpen = false)}
								>
									{link.label}
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Auth state navigation -->
				{#if !isLoggedIn}
					<!-- Public auth links -->
					{#each publicAuthLinks as link}
						<a
							href={link.href}
							data-testid={link.testId}
							class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
							onclick={() => (mobileMenuOpen = false)}
						>
							{link.label}
						</a>
					{/each}
				{:else}
					<!-- Admin link (only for admins) -->
					{#if isAdmin}
						{#each adminLinks as link}
							<a
								href={link.href}
								data-testid={link.testId}
								class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
								onclick={() => (mobileMenuOpen = false)}
							>
								{link.label}
							</a>
						{/each}
					{/if}

					<!-- Avatar Menu in mobile drawer -->
					<div class="pt-4 border-t">
						<AvatarMenu userEmail={userEmail} userId={user?.id} />
					</div>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</nav>
