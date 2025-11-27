<script lang="ts">
	import { Button, Sheet } from '$lib/components/ui';
	import { Menu } from 'lucide-svelte';
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

	const isLoggedIn = $derived(!!user);
	const userEmail = $derived(user?.email || '');
</script>

<nav data-testid="nav" class="w-full flex items-center justify-between px-8 py-6">
	<!-- Logo -->
	<a
		href="/"
		data-testid="nav-logo"
		class="text-2xl no-underline hover:no-underline cursor-pointer"
	>
		✨
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
