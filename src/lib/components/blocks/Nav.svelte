<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button, Sheet, DropdownMenu } from '$lib/components/ui';
	import { Menu, ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { NavLink, DropdownLink, AvatarConfig } from './types';

	interface Props {
		siteName?: string;
		logo?: string;
		logoIcon?: Snippet;
		user?: { id: string; email: string; name?: string | null } | null;
		isAdmin?: boolean;
		links?: NavLink[];
		avatar?: AvatarConfig;
		// Optional max-width for the nav content (e.g., 'max-w-6xl', 'max-w-4xl')
		maxWidth?: string;
	}

	let {
		siteName,
		logo,
		logoIcon,
		user = null,
		isAdmin = false,
		links = [],
		avatar,
		maxWidth
	}: Props = $props();

	// Detect if logo is an image path or text/emoji
	const isLogoImage = $derived(
		logo?.startsWith('/') ||
			logo?.startsWith('http') ||
			logo?.endsWith('.png') ||
			logo?.endsWith('.jpg') ||
			logo?.endsWith('.svg')
	);

	let mobileMenuOpen = $state(false);
	let expandedDropdowns = $state<Record<string, boolean>>({});

	const isLoggedIn = $derived(!!user);
	const userEmail = $derived(user?.email || '');
	const avatarLetter = $derived(userEmail ? userEmail.charAt(0).toUpperCase() : 'U');

	// Compute avatar config
	const showAvatar = $derived(avatar?.show !== false && isLoggedIn);
	const avatarLinks = $derived<DropdownLink[]>(avatar?.links ?? []);

	// Filter links based on auth state
	function shouldShowLink(link: NavLink): boolean {
		if (link.requiresAuth && !isLoggedIn) return false;
		if (link.requiresAdmin && !isAdmin) return false;
		if (link.hideWhenAuth && isLoggedIn) return false;
		return true;
	}

	const visibleLinks = $derived(links.filter(shouldShowLink));

	function toggleDropdown(key: string) {
		expandedDropdowns[key] = !expandedDropdowns[key];
	}

	// Get a unique key for dropdown state (label, testId, or href)
	function getDropdownKey(link: NavLink): string {
		return link.label ?? link.testId ?? link.href ?? 'dropdown';
	}

	function buildDataAttrs(data?: Record<string, string>): Record<string, string> {
		if (!data) return {};
		const result: Record<string, string> = {};
		for (const [key, value] of Object.entries(data)) {
			result[`data-${key}`] = value;
		}
		return result;
	}

	// Check if a link is active (matches current path)
	function isActive(href: string | undefined): boolean {
		if (!href) return false;
		const currentPath = $page.url.pathname;
		// For jump links (starting with #), never mark as active
		if (href.startsWith('#')) return false;
		// Exact match
		return currentPath === href;
	}
</script>

<nav data-testid="nav" class="w-full {maxWidth ? '' : 'flex items-center justify-between px-8'} py-6">
	<div class="{maxWidth ? `${maxWidth} mx-auto px-6 flex items-center justify-between` : 'contents'}">
	<!-- Logo -->
	<a
		href="/"
		data-testid="nav-logo"
		class="flex items-center gap-2 no-underline hover:no-underline cursor-pointer"
	>
		{#if logoIcon}
			<span class="text-2xl">
				{@render logoIcon()}
			</span>
		{:else if logo}
			{#if isLogoImage}
				<img src={logo} alt={siteName ?? ''} class="w-8 h-8" />
			{:else}
				<span>{logo}</span>
			{/if}
		{/if}
		{#if siteName}
			<span class="font-semibold text-lg tracking-tight">{siteName}</span>
		{/if}
	</a>

	<!-- Desktop Navigation - hidden on mobile -->
	<div class="hidden md:flex gap-6 items-center">
		{#each visibleLinks as link}
			{#if link.children}
				<!-- Dropdown link -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						data-testid={link.testId}
						id={link.id}
						class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1 {link.class ?? ''}"
						{...buildDataAttrs(link.data)}
					>
						{#if link.icon}
							{@const Icon = link.icon}
							<Icon class="h-4 w-4" />
						{/if}
						{#if link.label}{link.label}{/if}
						<ChevronDown class="h-3 w-3" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						{#each link.children as child}
							{#if child.separator}
								<DropdownMenu.Separator />
							{/if}
							<DropdownMenu.Item>
								{#if child.action}
									<form action={child.action} method={child.method ?? 'POST'} use:enhance class="w-full">
										<button
											type="submit"
											data-testid={child.testId}
											id={child.id}
											class="flex items-center gap-2 cursor-pointer w-full text-left {child.class ?? ''}"
											{...buildDataAttrs(child.data)}
										>
											{#if child.icon}
												{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
											{/if}
											{child.label}
										</button>
									</form>
								{:else}
									<a
										href={child.href ?? '#'}
										data-testid={child.testId}
										id={child.id}
										class="flex items-center gap-2 w-full cursor-pointer {child.class ?? ''}"
										{...buildDataAttrs(child.data)}
									>
										{#if child.icon}
											{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
										{/if}
										{child.label}
									</a>
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<!-- Regular link -->
				<a
					href={link.href ?? '#'}
					data-testid={link.testId}
					id={link.id}
					class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1 {isActive(link.href) ? 'font-semibold' : ''} {link.class ?? ''}"
					{...buildDataAttrs(link.data)}
				>
					{#if link.icon}
						{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
					{/if}
					{#if link.label}{link.label}{/if}
				</a>
			{/if}
		{/each}

		<!-- Avatar (shown when logged in) -->
		{#if showAvatar}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					data-testid="nav-avatar"
					class="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-600 text-xs cursor-pointer hover:bg-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
					aria-label="User menu"
				>
					{avatarLetter}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content data-testid="nav-user-menu" class="w-48">
					{#each avatarLinks as link}
						{#if link.separator}
							<DropdownMenu.Separator />
						{/if}
						<DropdownMenu.Item>
							{#if link.action}
								<form action={link.action} method={link.method ?? 'POST'} use:enhance class="w-full">
									<button
										type="submit"
										data-testid={link.testId}
										id={link.id}
										class="flex items-center gap-2 cursor-pointer w-full text-left {link.class ?? ''}"
										{...buildDataAttrs(link.data)}
									>
										{#if link.icon}
											{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
										{/if}
										{#if link.label}{link.label}{/if}
									</button>
								</form>
							{:else}
								<a
									href={link.href ?? '#'}
									data-testid={link.testId}
									id={link.id}
									class="flex items-center gap-2 cursor-pointer w-full {link.class ?? ''}"
									{...buildDataAttrs(link.data)}
								>
									{#if link.icon}
										{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
									{/if}
									{#if link.label}{link.label}{/if}
								</a>
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
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
	</div>

	<!-- Mobile Sheet -->
	<Sheet.Root bind:open={mobileMenuOpen}>
		<Sheet.Content side="left" data-testid="nav-mobile-drawer">
			<Sheet.Header>
				{#if siteName}
					<Sheet.Title>{siteName}</Sheet.Title>
				{/if}
			</Sheet.Header>
			<div class="flex flex-col gap-4 mt-6 px-4">
				{#each visibleLinks as link}
					{#if link.children}
						<!-- Expandable section for dropdowns -->
						<div>
							<button
								class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1 w-full {link.class ?? ''}"
								data-testid={link.testId}
								id={link.id}
								onclick={() => toggleDropdown(getDropdownKey(link))}
								{...buildDataAttrs(link.data)}
							>
								{#if link.icon}
									{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
								{/if}
								{#if link.label}{link.label}{/if}
								<ChevronDown class="h-3 w-3 transition-transform {expandedDropdowns[getDropdownKey(link)] ? 'rotate-180' : ''}" />
							</button>
							{#if expandedDropdowns[getDropdownKey(link)]}
								<div class="ml-4 mt-2 flex flex-col gap-2">
									{#each link.children as child}
										{#if child.action}
											<form action={child.action} method={child.method ?? 'POST'} use:enhance class="w-full">
												<button
													type="submit"
													data-testid={child.testId}
													id={child.id}
													class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-2 {child.class ?? ''}"
													{...buildDataAttrs(child.data)}
												>
													{#if child.icon}
														{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
													{/if}
													{child.label}
												</button>
											</form>
										{:else}
											<a
												href={child.href ?? '#'}
												data-testid={child.testId}
												id={child.id}
												class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-2 {child.class ?? ''}"
												onclick={() => (mobileMenuOpen = false)}
												{...buildDataAttrs(child.data)}
											>
												{#if child.icon}
													{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
												{/if}
												{child.label}
											</a>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<!-- Regular link -->
						<a
							href={link.href ?? '#'}
							data-testid={link.testId}
							id={link.id}
							class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1 {isActive(link.href) ? 'font-semibold' : ''} {link.class ?? ''}"
							onclick={() => (mobileMenuOpen = false)}
							{...buildDataAttrs(link.data)}
						>
							{#if link.icon}
								{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
							{/if}
							{#if link.label}{link.label}{/if}
						</a>
					{/if}
				{/each}

				<!-- Avatar Menu in mobile drawer -->
				{#if showAvatar}
					<div class="pt-4 border-t">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-600 text-xs">
								{avatarLetter}
							</div>
							<span class="text-sm text-zinc-600">{userEmail}</span>
						</div>
						<div class="flex flex-col gap-2">
							{#each avatarLinks as link}
								{#if link.action}
									<form action={link.action} method={link.method ?? 'POST'} use:enhance class="w-full">
										<button
											type="submit"
											data-testid={link.testId}
											id={link.id}
											class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-2 w-full {link.class ?? ''}"
											{...buildDataAttrs(link.data)}
										>
											{#if link.icon}
												{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
											{/if}
											{#if link.label}{link.label}{/if}
										</button>
									</form>
								{:else}
									<a
										href={link.href ?? '#'}
										data-testid={link.testId}
										id={link.id}
										class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-2 {link.class ?? ''}"
										onclick={() => (mobileMenuOpen = false)}
										{...buildDataAttrs(link.data)}
									>
										{#if link.icon}
											{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
										{/if}
										{#if link.label}{link.label}{/if}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</nav>
