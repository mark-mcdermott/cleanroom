import type { ProjectConfig } from '../types';
import { getFaviconExtension } from './files';

// Helper to get logo image src with correct extension
function getLogoSrc(config: ProjectConfig): string {
	const ext = getFaviconExtension(config.logo.value);
	return `/logo.${ext}`;
}

// Helper to get display name for UI (prettyName if set, otherwise projectName)
function getDisplayName(config: ProjectConfig): string {
	return config.prettyName || config.projectName;
}

// Desktop-only Nav - no mobile menu, hidden on small screens
export function getDesktopOnlyNav(config: ProjectConfig, links?: { href: string; label: string }[]): string {
	const displayName = getDisplayName(config);
	const logoDisplay =
		config.logo.type === 'emoji'
			? config.logo.value
			: `<img src="${getLogoSrc(config)}" alt="${displayName}" class="h-8 w-auto object-contain" />`;

	const navLinks = links
		? links
				.map(
					(link) =>
						`<a href="${link.href}" class="text-sm text-muted-foreground hover:text-foreground transition-colors">${link.label}</a>`
				)
				.join('\n\t\t\t\t')
		: '';

	return `<nav class="w-full flex items-center justify-between px-8 py-6">
	<a href="/" class="text-2xl no-underline hover:no-underline">
		${logoDisplay}
	</a>
	${links ? `<div class="flex gap-6">\n\t\t\t\t${navLinks}\n\t\t\t</div>` : ''}
</nav>`;
}

// Full Nav - with mobile menu (hamburger → drawer)
// Note: Requires `let mobileMenuOpen = $state(false);` in the parent component's script
export function getNav(
	config: ProjectConfig,
	links: { href: string; label: string }[]
): string {
	const displayName = getDisplayName(config);
	const logoDisplay =
		config.logo.type === 'emoji'
			? config.logo.value
			: `<img src="${getLogoSrc(config)}" alt="${displayName}" class="h-8 w-auto object-contain" />`;

	const desktopLinks = links
		.map(
			(link) =>
				`<a href="${link.href}" class="text-sm text-muted-foreground hover:text-foreground transition-colors">${link.label}</a>`
		)
		.join('\n\t\t\t\t');

	const mobileLinks = links
		.map(
			(link) =>
				`<a href="${link.href}" class="block py-2 text-muted-foreground hover:text-foreground" onclick={() => mobileMenuOpen = false}>${link.label}</a>`
		)
		.join('\n\t\t\t\t\t');

	return `<nav class="w-full flex items-center justify-between px-8 py-6">
	<a href="/" class="text-2xl no-underline hover:no-underline">
		${logoDisplay}
	</a>

	<!-- Desktop Navigation -->
	<div class="hidden md:flex gap-6 items-center">
		${desktopLinks}
	</div>

	<!-- Mobile Hamburger -->
	<button
		class="md:hidden p-2"
		onclick={() => mobileMenuOpen = true}
		aria-label="Open navigation menu"
	>
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	</button>
</nav>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<div class="fixed inset-0 z-50 md:hidden">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/50"
			onclick={() => mobileMenuOpen = false}
			aria-label="Close menu"
		></button>

		<!-- Drawer -->
		<div class="absolute left-0 top-0 h-full w-64 bg-card shadow-xl">
			<div class="flex items-center justify-between p-4 border-b">
				<span class="font-semibold">${displayName}</span>
				<button onclick={() => mobileMenuOpen = false} aria-label="Close menu">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-4 flex flex-col gap-2">
				${mobileLinks}
			</div>
		</div>
	</div>
{/if}`;
}

// Simple Hero
export function getSimpleHero(config: ProjectConfig): string {
	const displayName = getDisplayName(config);
	const logoDisplay =
		config.logo.type === 'emoji'
			? `<span class="text-5xl sm:text-6xl">${config.logo.value}</span>`
			: `<img src="${getLogoSrc(config)}" alt="${displayName}" class="h-12 sm:h-16 w-auto object-contain" />`;

	return `<div class="w-full flex justify-center items-center text-center min-h-[60vh]">
	<div class="my-32 sm:my-48">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			${logoDisplay}
			${displayName}
		</h1>
	</div>
</div>`;
}

// Hero with scroll sections
export function getSectionHero(config: ProjectConfig, sections: string[]): string {
	const displayName = getDisplayName(config);
	const logoDisplay =
		config.logo.type === 'emoji'
			? `<span class="text-5xl sm:text-6xl">${config.logo.value}</span>`
			: `<img src="${getLogoSrc(config)}" alt="${displayName}" class="h-12 sm:h-16 w-auto object-contain" />`;

	const sectionLinks = sections
		.map((section) => `<a href="#${section.toLowerCase()}" class="btn btn-light">${section}</a>`)
		.join('\n\t\t\t');

	return `<div class="w-full flex justify-center items-center text-center min-h-[80vh]">
	<div class="my-16 sm:my-24">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			${logoDisplay}
			${displayName}
		</h1>
		<div class="flex flex-wrap justify-center gap-4 mt-8">
			${sectionLinks}
		</div>
	</div>
</div>`;
}

// Section component
export function getSection(id: string, title: string, content: string): string {
	// Split content by double newlines to create paragraphs
	const paragraphs = content
		.split('\n\n')
		.map((p) => p.trim())
		.filter((p) => p.length > 0)
		.map((p) => `<p class="text-muted-foreground text-lg mb-4 last:mb-0">${p}</p>`)
		.join('\n\t\t\t');

	return `<section id="${id}" class="py-24 px-8 scroll-mt-20">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-semibold tracking-tight mb-6">${title}</h2>
		<div class="space-y-4">
			${paragraphs}
		</div>
	</div>
</section>`;
}

// Footer
export function getFooter(config: ProjectConfig): string {
	const displayName = getDisplayName(config);
	return `<footer class="border-t">
	<div class="mx-auto max-w-6xl px-6 sm:px-10 py-8 text-sm text-muted-foreground">
		© {new Date().getFullYear()} ${displayName}
	</div>
</footer>`;
}

// Header with border (for multi-page sites)
// Note: Requires `let mobileMenuOpen = $state(false);` in the parent component's script
// When hasAuth is true, auth links (login/signup) are rendered conditionally based on data.user
export function getHeader(
	config: ProjectConfig,
	links: { href: string; label: string }[],
	options?: { hasAuth?: boolean }
): string {
	const displayName = getDisplayName(config);
	const logoDisplay =
		config.logo.type === 'emoji'
			? config.logo.value
			: `<img src="${getLogoSrc(config)}" alt="${displayName}" class="h-6 w-auto object-contain" />`;

	const hasAuth = options?.hasAuth ?? false;

	// Separate auth links from regular links
	const authHrefs = ['/login', '/signup'];
	const regularLinks = hasAuth ? links.filter((l) => !authHrefs.includes(l.href)) : links;

	const desktopLinks = regularLinks
		.map(
			(link) =>
				`<a href="${link.href}" class="hover:underline underline-offset-4">${link.label}</a>`
		)
		.join('\n\t\t\t\t');

	const mobileLinks = regularLinks
		.map(
			(link) =>
				`<a href="${link.href}" class="block py-2 hover:text-foreground" onclick={() => mobileMenuOpen = false}>${link.label}</a>`
		)
		.join('\n\t\t\t\t\t');

	// Auth-aware desktop links
	const desktopAuthSection = hasAuth
		? `
				{#if data.user}
					<form action="/logout" method="POST" class="inline">
						<button type="submit" class="hover:underline underline-offset-4">Log Out</button>
					</form>
				{:else}
					<a href="/login" class="hover:underline underline-offset-4">Log In</a>
					<a href="/signup" class="hover:underline underline-offset-4">Sign Up</a>
				{/if}`
		: '';

	// Auth-aware mobile links
	const mobileAuthSection = hasAuth
		? `
				{#if data.user}
					<form action="/logout" method="POST">
						<button type="submit" class="block py-2 hover:text-foreground w-full text-left" onclick={() => mobileMenuOpen = false}>Log Out</button>
					</form>
				{:else}
					<a href="/login" class="block py-2 hover:text-foreground" onclick={() => mobileMenuOpen = false}>Log In</a>
					<a href="/signup" class="block py-2 hover:text-foreground" onclick={() => mobileMenuOpen = false}>Sign Up</a>
				{/if}`
		: '';

	return `<header class="border-b">
	<div class="mx-auto max-w-6xl px-6 sm:px-10 h-16 flex items-center justify-between">
		<a href="/" class="font-semibold text-lg tracking-tight flex items-center gap-2">
			${logoDisplay}
			<span>${displayName}</span>
		</a>

		<!-- Desktop Nav -->
		<div class="hidden md:flex items-center gap-4">
			<nav class="flex items-center gap-4">
				${desktopLinks}${desktopAuthSection}
			</nav>
		</div>

		<!-- Mobile Hamburger -->
		<button
			class="md:hidden p-2"
			onclick={() => mobileMenuOpen = true}
			aria-label="Open navigation menu"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</div>
</header>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<div class="fixed inset-0 z-50 md:hidden">
		<button
			class="absolute inset-0 bg-black/50"
			onclick={() => mobileMenuOpen = false}
			aria-label="Close menu"
		></button>

		<div class="absolute left-0 top-0 h-full w-64 bg-card shadow-xl">
			<div class="flex items-center justify-between p-4 border-b">
				<span class="font-semibold">${displayName}</span>
				<button onclick={() => mobileMenuOpen = false} aria-label="Close menu">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<nav class="p-4 flex flex-col gap-2">
				${mobileLinks}${mobileAuthSection}
			</nav>
		</div>
	</div>
{/if}`;
}
