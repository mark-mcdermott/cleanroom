import type { ProjectConfig } from '../types';

// Desktop-only Nav - no mobile menu, hidden on small screens
export function getDesktopOnlyNav(config: ProjectConfig, links?: { href: string; label: string }[]): string {
	const logoDisplay =
		config.logo.type === 'emoji'
			? config.logo.value
			: `<img src="/logo.png" alt="${config.projectName}" class="h-8 w-8" />`;

	const navLinks = links
		? links
				.map(
					(link) =>
						`<a href="${link.href}" class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors">${link.label}</a>`
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
export function getNav(
	config: ProjectConfig,
	links: { href: string; label: string }[]
): string {
	const logoDisplay =
		config.logo.type === 'emoji'
			? config.logo.value
			: `<img src="/logo.png" alt="${config.projectName}" class="h-8 w-8" />`;

	const desktopLinks = links
		.map(
			(link) =>
				`<a href="${link.href}" class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors">${link.label}</a>`
		)
		.join('\n\t\t\t\t');

	const mobileLinks = links
		.map(
			(link) =>
				`<a href="${link.href}" class="block py-2 text-zinc-700 hover:text-zinc-900" onclick={() => mobileMenuOpen = false}>${link.label}</a>`
		)
		.join('\n\t\t\t\t\t');

	return `<script lang="ts">
	let mobileMenuOpen = $state(false);
</script>

<nav class="w-full flex items-center justify-between px-8 py-6">
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
		<div class="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
			<div class="flex items-center justify-between p-4 border-b">
				<span class="font-semibold">${config.projectName}</span>
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
	const logoDisplay =
		config.logo.type === 'emoji'
			? `<span class="text-5xl sm:text-6xl">${config.logo.value}</span>`
			: `<img src="/logo.png" alt="${config.projectName}" class="w-12 h-12 sm:w-16 sm:h-16" />`;

	return `<div class="w-full flex justify-center items-center text-center min-h-[60vh]">
	<div class="my-32 sm:my-48">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			${logoDisplay}
			${config.projectName}
		</h1>
	</div>
</div>`;
}

// Hero with scroll sections
export function getSectionHero(config: ProjectConfig, sections: string[]): string {
	const logoDisplay =
		config.logo.type === 'emoji'
			? `<span class="text-5xl sm:text-6xl">${config.logo.value}</span>`
			: `<img src="/logo.png" alt="${config.projectName}" class="w-12 h-12 sm:w-16 sm:h-16" />`;

	const sectionLinks = sections
		.map((section) => `<a href="#${section.toLowerCase()}" class="btn btn-light">${section}</a>`)
		.join('\n\t\t\t');

	return `<div class="w-full flex justify-center items-center text-center min-h-[80vh]">
	<div class="my-16 sm:my-24">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			${logoDisplay}
			${config.projectName}
		</h1>
		<div class="flex flex-wrap justify-center gap-4 mt-8">
			${sectionLinks}
		</div>
	</div>
</div>`;
}

// Section component
export function getSection(id: string, title: string, content: string): string {
	return `<section id="${id}" class="py-24 px-8">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-semibold tracking-tight mb-6">${title}</h2>
		<p class="text-zinc-600 text-lg">
			${content}
		</p>
	</div>
</section>`;
}

// Footer
export function getFooter(config: ProjectConfig): string {
	return `<footer class="border-t">
	<div class="mx-auto max-w-6xl px-6 sm:px-10 py-8 text-sm text-zinc-600">
		© {new Date().getFullYear()} ${config.projectName}
	</div>
</footer>`;
}

// Header with border (for multi-page sites)
export function getHeader(config: ProjectConfig, links: { href: string; label: string }[]): string {
	const logoDisplay =
		config.logo.type === 'emoji'
			? config.logo.value
			: `<img src="/logo.png" alt="${config.projectName}" class="h-6 w-6" />`;

	const desktopLinks = links
		.map(
			(link) =>
				`<a href="${link.href}" class="hover:underline underline-offset-4">${link.label}</a>`
		)
		.join('\n\t\t\t\t');

	const mobileLinks = links
		.map(
			(link) =>
				`<a href="${link.href}" class="block py-2 hover:text-zinc-900" onclick={() => mobileMenuOpen = false}>${link.label}</a>`
		)
		.join('\n\t\t\t\t\t');

	return `<script lang="ts">
	let mobileMenuOpen = $state(false);
</script>

<header class="border-b">
	<div class="mx-auto max-w-6xl px-6 sm:px-10 h-16 flex items-center justify-between">
		<a href="/" class="font-semibold text-lg tracking-tight flex items-center gap-2">
			${logoDisplay}
			<span>${config.projectName}</span>
		</a>

		<!-- Desktop Nav -->
		<nav class="hidden md:flex items-center gap-4">
			${desktopLinks}
		</nav>

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

		<div class="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
			<div class="flex items-center justify-between p-4 border-b">
				<span class="font-semibold">${config.projectName}</span>
				<button onclick={() => mobileMenuOpen = false} aria-label="Close menu">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<nav class="p-4 flex flex-col gap-2">
				${mobileLinks}
			</nav>
		</div>
	</div>
{/if}`;
}
