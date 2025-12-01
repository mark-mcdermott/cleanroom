<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button, Sheet, DropdownMenu, ThemeToggle } from '$lib/components/ui';
	import type { ToggleMode } from '$lib/components/ui/theme-toggle/ThemeToggle.svelte';
	import { Menu, ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { NavLink, DropdownLink, AvatarConfig } from './types';

	interface Props {
		siteName?: string;
		logo?: string;
		logoIcon?: Snippet;
		user?: { id: string; email: string; name?: string | null; avatarUrl?: string | null } | null;
		isAdmin?: boolean;
		links?: NavLink[];
		avatar?: AvatarConfig;
		// Optional max-width for the nav content (e.g., 'max-w-6xl', 'max-w-4xl')
		maxWidth?: string;
		// Theme toggle settings
		showThemeToggle?: boolean;
		themeToggleMode?: ToggleMode;
	}

	let {
		siteName,
		logo,
		logoIcon,
		user = null,
		isAdmin = false,
		links = [],
		avatar,
		maxWidth,
		showThemeToggle = false,
		themeToggleMode = 'light-dark-system'
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
	const userAvatarUrl = $derived(user?.avatarUrl);

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

	// Get icon size class based on iconSize prop
	function getIconSizeClass(size?: 'sm' | 'md' | 'lg'): string {
		switch (size) {
			case 'sm':
				return 'h-4 w-4';
			case 'lg':
				return 'h-6 w-6';
			case 'md':
			default:
				return 'h-5 w-5';
		}
	}
</script>

<nav data-testid="nav" class="relative z-10 w-full {maxWidth ? '' : 'flex items-center justify-between px-8'} py-6">
	<div class="{maxWidth ? `${maxWidth} mx-auto px-6 flex items-center justify-between` : 'contents'}">

	<!-- Logo -->
	<a
		href="/"
		data-testid="nav-logo"
		class="flex items-center gap-2 no-underline hover:no-underline cursor-pointer"
	>
		<span class="text-2xl text-foreground">
			<svg
				viewBox="0 0 141 112"
				class="w-8 h-8 fill-current"
				aria-hidden="true"
			>
				<path d="M79,0c10.01,3.21,18.26,6.62,22.49,17.01,3.02,7.42,4.13,30.01,1.02,37-2.9,6.5-10.79,9.08-17.07,10.93-1.74,9.28,3.69,24.84-11.38,20.01l-.07-4.95c-2.4.52-1.48,4.12-3.62,4.87-10.14,3.52-5.66-6.04-8.88-10.86-.3,4.95-3.14,11.32-9.09,8.09-2.97-2.4-.66-14.06-1.45-18.06-6.42.45-14.48-5.64-15.73-11.77-1.54-7.55-.65-27.88,2.59-34.95C42.78,6.5,51.39,3.34,62,0h17ZM52.73,31.23c-13.16,2.75-12.1,25.21,3.71,22.71,11.59-1.83,14.96-26.62-3.71-22.71ZM81.74,31.23c-19.17,3.36-2.79,35.02,8.27,19.28,6.27-8.93,5.07-21.61-8.27-19.28ZM67.99,48c-1.96,2.45-7.13,11.63-6.97,14.42.41,7.32,13.63,6.76,13.01.15-.25-2.66-7.17-9.92-6.04-14.57Z"/>
				<path d="M113,112c-5.32-3.6-4.02-8.53-3.44-13.99l-17.34-13.21.79-12.8,22.93,14.58c7.42-6.46,19.9-3.48,17.61,7.43-1.21,5.77-6.86,5.1-8.08,6.96s-.22,8.53-4.47,11.03h-8Z"/>
				<path d="M17,112c-4.82-2.73-3.16-9.08-4.45-11.05-1.21-1.84-14.38-4.21-7.99-13.89,5.58-8.44,13.5.45,16.69-.22l21.23-12.84,1.06,12.01-15.08,12.03c.85,6.13,1.41,10.36-4.47,13.98h-7v-.02Z"/>
				<path d="M141,45c-4.49,5.42-11.71,5.63-15.14-.88l-14.86,7.88c.49-4.14-1.15-9.9.94-13.55,1.14-1.99,5.55-3.69,5.95-5.1.36-1.27-.99-3.84-.95-5.81.2-11.43,16.17-11.63,17.03-.9.15,1.87-1.11,4.16-.98,4.34.28.39,7.39,2.05,8,5.03v9h0Z"/>
				<path d="M0,39c.17-4.35,7.66-6.6,7.99-7.04s-2.65-5.98,1.46-10c7.2-7.03,17.13,4.2,11.97,12.07,9.84,4.5,3.54,10.23,6.59,18.46-4.86.24-9.23-4.59-12.65-7.42-6.31,5.57-11.2,5.81-15.37-2.07v-4h0Z"/>
			</svg>
		</span>

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
						class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 {link.class ?? ''}"
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
					class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 {isActive(link.href) ? 'font-semibold' : ''} {link.class ?? ''}"
					{...buildDataAttrs(link.data)}
				>
					{#if link.icon}
						{@const Icon = link.icon}
								<Icon class={getIconSizeClass(link.iconSize)} />
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
					class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs cursor-pointer hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden"
					aria-label="User menu"
				>
					{#if userAvatarUrl}
						<img src={userAvatarUrl} alt="User avatar" class="w-full h-full object-cover" />
					{:else}
						{avatarLetter}
					{/if}
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

		<!-- Theme Toggle -->
		{#if showThemeToggle}
			<ThemeToggle.Root mode={themeToggleMode} />
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
								class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 w-full {link.class ?? ''}"
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
													class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 {child.class ?? ''}"
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
												class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 {child.class ?? ''}"
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
							class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 {isActive(link.href) ? 'font-semibold' : ''} {link.class ?? ''}"
							onclick={() => (mobileMenuOpen = false)}
							{...buildDataAttrs(link.data)}
						>
							{#if link.icon}
								{@const Icon = link.icon}
								<Icon class={getIconSizeClass(link.iconSize)} />
							{/if}
							{#if link.label}{link.label}{/if}
						</a>
					{/if}
				{/each}

				<!-- Avatar Menu in mobile drawer -->
				{#if showAvatar}
					<div class="pt-4 border-t border-border">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
								{#if userAvatarUrl}
									<img src={userAvatarUrl} alt="User avatar" class="w-full h-full object-cover" />
								{:else}
									{avatarLetter}
								{/if}
							</div>
							<span class="text-sm text-muted-foreground">{userEmail}</span>
						</div>
						<div class="flex flex-col gap-2">
							{#each avatarLinks as link}
								{#if link.action}
									<form action={link.action} method={link.method ?? 'POST'} use:enhance class="w-full">
										<button
											type="submit"
											data-testid={link.testId}
											id={link.id}
											class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 w-full {link.class ?? ''}"
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
										class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 {link.class ?? ''}"
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

				<!-- Theme Toggle in mobile drawer -->
				{#if showThemeToggle}
					<div class="pt-4 border-t border-border flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Theme</span>
						<ThemeToggle.Root mode={themeToggleMode} />
					</div>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</nav>
