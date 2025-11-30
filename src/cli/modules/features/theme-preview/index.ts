import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// ============================================================================
// THEMEFORSEEN COMPONENT
// ============================================================================

function getThemeForseenComponent(): string {
	return `<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Palette, Type, X, Sun, Moon, Sparkles, Zap } from 'lucide-svelte';

	// Color themes
	const colorThemes = [
		{
			name: 'Ocean Blue',
			tags: ['corporate'],
			light: {
				primary: '#0066CC', primaryShadow: '#004C99', accent: '#FF6B35', accentShadow: '#CC5529',
				background: '#FFFFFF', cardBackground: '#F5F5F5', text: '#333333', extra: '#00D4FF'
			},
			dark: {
				primary: '#3399FF', primaryShadow: '#0066CC', accent: '#FF8C5A', accentShadow: '#FF6B35',
				background: '#1A1A1A', cardBackground: '#2A2A2A', text: '#E0E0E0', extra: '#00D4FF'
			}
		},
		{
			name: 'Forest Green',
			tags: ['nature'],
			light: {
				primary: '#2D6A4F', primaryShadow: '#1B4332', accent: '#D4A373', accentShadow: '#B8865B',
				background: '#FEFEFE', cardBackground: '#F1FAEE', text: '#1B4332', extra: '#52B788'
			},
			dark: {
				primary: '#52B788', primaryShadow: '#2D6A4F', accent: '#E9C46A', accentShadow: '#D4A373',
				background: '#1B1B1B', cardBackground: '#2D3E2F', text: '#E8F3E8', extra: '#95D5B2'
			}
		},
		{
			name: 'Sunset Pink',
			tags: ['funky'],
			light: {
				primary: '#E63946', primaryShadow: '#C5303D', accent: '#FFB703', accentShadow: '#DC9F02',
				background: '#FFFFFF', cardBackground: '#FFF3F3', text: '#2B2D42', extra: '#FB5607'
			},
			dark: {
				primary: '#FF5A67', primaryShadow: '#E63946', accent: '#FFD60A', accentShadow: '#FFB703',
				background: '#1A1A2E', cardBackground: '#2B2D42', text: '#EDF2F4', extra: '#FB5607'
			}
		},
		{
			name: 'Purple Dream',
			tags: ['funky'],
			light: {
				primary: '#7209B7', primaryShadow: '#560BAD', accent: '#F72585', accentShadow: '#D90368',
				background: '#FFFFFF', cardBackground: '#F8F0FF', text: '#2B2D42', extra: '#4CC9F0'
			},
			dark: {
				primary: '#B388FF', primaryShadow: '#7209B7', accent: '#FF4DA6', accentShadow: '#F72585',
				background: '#1A1A2E', cardBackground: '#2D2A3E', text: '#E0E0E0', extra: '#4CC9F0'
			}
		},
		{
			name: 'Midnight Blue',
			tags: ['corporate'],
			light: {
				primary: '#1A365D', primaryShadow: '#0D1B2A', accent: '#E07A5F', accentShadow: '#C96248',
				background: '#FFFFFF', cardBackground: '#F7FAFC', text: '#2D3748', extra: '#4A5568'
			},
			dark: {
				primary: '#63B3ED', primaryShadow: '#4299E1', accent: '#FC8181', accentShadow: '#F56565',
				background: '#1A202C', cardBackground: '#2D3748', text: '#E2E8F0', extra: '#718096'
			}
		},
		{
			name: 'Coral Reef',
			tags: ['funky', 'nature'],
			light: {
				primary: '#FF6B6B', primaryShadow: '#EE5A5A', accent: '#4ECDC4', accentShadow: '#3DBDB5',
				background: '#FFFFFF', cardBackground: '#FFF5F5', text: '#2C3E50', extra: '#FFE66D'
			},
			dark: {
				primary: '#FF8787', primaryShadow: '#FF6B6B', accent: '#63E2D9', accentShadow: '#4ECDC4',
				background: '#1A1A2E', cardBackground: '#2E2E42', text: '#ECF0F1', extra: '#FFE66D'
			}
		}
	];

	// Font pairings
	const fontPairings = [
		{ name: 'Classic', heading: 'Georgia, serif', body: 'system-ui, sans-serif' },
		{ name: 'Modern', heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
		{ name: 'Elegant', heading: 'Playfair Display, serif', body: 'Lato, sans-serif' },
		{ name: 'Bold', heading: 'Oswald, sans-serif', body: 'Open Sans, sans-serif' },
		{ name: 'Minimal', heading: 'Helvetica Neue, sans-serif', body: 'Arial, sans-serif' },
		{ name: 'Creative', heading: 'Poppins, sans-serif', body: 'Nunito, sans-serif' },
		{ name: 'Editorial', heading: 'Merriweather, serif', body: 'Source Sans Pro, sans-serif' },
		{ name: 'Tech', heading: 'JetBrains Mono, monospace', body: 'IBM Plex Sans, sans-serif' }
	];

	// State
	let isDrawerOpen = $state(false);
	let selectedThemeIndex = $state(0);
	let selectedFontIndex = $state(0);
	let isDarkMode = $state(false);
	let activeTab = $state<'colors' | 'fonts'>('colors');

	// Check if theme_forseen query param is present
	let showTab = $derived($page.url.searchParams.get('theme_forseen') === 'true');

	function applyTheme(themeIndex: number) {
		if (!browser) return;
		const theme = colorThemes[themeIndex];
		const colors = isDarkMode ? theme.dark : theme.light;

		document.documentElement.style.setProperty('--color-primary', colors.primary);
		document.documentElement.style.setProperty('--color-primary-shadow', colors.primaryShadow);
		document.documentElement.style.setProperty('--color-accent', colors.accent);
		document.documentElement.style.setProperty('--color-accent-shadow', colors.accentShadow);
		document.documentElement.style.setProperty('--color-bg', colors.background);
		document.documentElement.style.setProperty('--color-card-bg', colors.cardBackground);
		document.documentElement.style.setProperty('--color-text', colors.text);
		document.documentElement.style.setProperty('--color-extra', colors.extra);
	}

	function applyFonts(fontIndex: number) {
		if (!browser) return;
		const font = fontPairings[fontIndex];
		document.documentElement.style.setProperty('--font-heading', font.heading);
		document.documentElement.style.setProperty('--font-body', font.body);
	}

	function toggleDrawer() { isDrawerOpen = !isDrawerOpen; }
	function selectTheme(index: number) { selectedThemeIndex = index; applyTheme(index); }
	function selectFont(index: number) { selectedFontIndex = index; applyFonts(index); }
	function toggleDarkMode() { isDarkMode = !isDarkMode; applyTheme(selectedThemeIndex); }

	onMount(() => {
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		applyTheme(selectedThemeIndex);
		applyFonts(selectedFontIndex);
	});
</script>

{#if showTab}
	<!-- Tab Button -->
	<button
		onclick={toggleDrawer}
		class="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-l-lg shadow-lg transition-transform hover:translate-x-0 cursor-pointer"
		class:translate-x-full={isDrawerOpen}
		style="background-color: var(--color-primary, #7209B7); color: white;"
		aria-label="Toggle theme drawer"
	>
		<Palette class="w-6 h-6" />
	</button>

	<!-- Drawer -->
	<div
		class="fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 shadow-2xl overflow-hidden"
		class:translate-x-0={isDrawerOpen}
		class:translate-x-full={!isDrawerOpen}
		style="background-color: var(--color-bg, #ffffff);"
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b" style="border-color: var(--color-card-bg, #F8F0FF);">
			<div class="flex items-center gap-2">
				<Sparkles class="w-5 h-5" style="color: var(--color-primary, #7209B7);" />
				<span class="font-semibold">ThemeForseen</span>
			</div>
			<div class="flex items-center gap-2">
				<button onclick={toggleDarkMode} class="p-2 rounded-lg cursor-pointer hover:opacity-80" style="background-color: var(--color-card-bg, #F8F0FF);">
					{#if isDarkMode}<Sun class="w-4 h-4" />{:else}<Moon class="w-4 h-4" />{/if}
				</button>
				<button onclick={toggleDrawer} class="p-2 rounded-lg hover:opacity-80 cursor-pointer">
					<X class="w-5 h-5" />
				</button>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex border-b" style="border-color: var(--color-card-bg, #F8F0FF);">
			<button
				onclick={() => (activeTab = 'colors')}
				class="flex-1 p-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
				class:border-b-2={activeTab === 'colors'}
				class:opacity-60={activeTab !== 'colors'}
				style={activeTab === 'colors' ? 'border-color: var(--color-primary, #7209B7);' : ''}
			>
				<Palette class="w-4 h-4" /> Colors
			</button>
			<button
				onclick={() => (activeTab = 'fonts')}
				class="flex-1 p-3 flex items-center justify-center gap-2 transition-colors cursor-pointer"
				class:border-b-2={activeTab === 'fonts'}
				class:opacity-60={activeTab !== 'fonts'}
				style={activeTab === 'fonts' ? 'border-color: var(--color-primary, #7209B7);' : ''}
			>
				<Type class="w-4 h-4" /> Fonts
			</button>
		</div>

		<!-- Content -->
		<div class="p-4 overflow-y-auto" style="height: calc(100% - 120px);">
			{#if activeTab === 'colors'}
				<div class="space-y-3">
					{#each colorThemes as theme, index}
						<button
							onclick={() => selectTheme(index)}
							class="w-full p-4 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02]"
							class:ring-2={selectedThemeIndex === index}
							style="background-color: var(--color-card-bg, #F8F0FF); {selectedThemeIndex === index ? 'ring-color: var(--color-primary, #7209B7);' : ''}"
						>
							<div class="flex items-center justify-between mb-2">
								<span class="font-medium">{theme.name}</span>
								{#if selectedThemeIndex === index}<Zap class="w-4 h-4" style="color: var(--color-primary, #7209B7);" />{/if}
							</div>
							<div class="flex gap-1">
								{@const colors = isDarkMode ? theme.dark : theme.light}
								<div class="w-8 h-6 rounded" style="background-color: {colors.primary};"></div>
								<div class="w-8 h-6 rounded" style="background-color: {colors.accent};"></div>
								<div class="w-8 h-6 rounded border" style="background-color: {colors.background}; border-color: {colors.text}20;"></div>
								<div class="w-8 h-6 rounded" style="background-color: {colors.extra};"></div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="space-y-3">
					{#each fontPairings as font, index}
						<button
							onclick={() => selectFont(index)}
							class="w-full p-4 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02]"
							class:ring-2={selectedFontIndex === index}
							style="background-color: var(--color-card-bg, #F8F0FF); {selectedFontIndex === index ? 'ring-color: var(--color-primary, #7209B7);' : ''}"
						>
							<div class="flex items-center justify-between mb-2">
								<span class="font-medium" style="font-family: {font.heading};">{font.name}</span>
								{#if selectedFontIndex === index}<Zap class="w-4 h-4" style="color: var(--color-primary, #7209B7);" />{/if}
							</div>
							<p class="text-sm opacity-70" style="font-family: {font.body};">The quick brown fox jumps over the lazy dog.</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Backdrop -->
	{#if isDrawerOpen}
		<button onclick={toggleDrawer} class="fixed inset-0 bg-black/20 z-40 cursor-pointer" aria-label="Close drawer"></button>
	{/if}
{/if}
`;
}

// ============================================================================
// THEME PREVIEW PAGE
// ============================================================================

function getThemePreviewPage(): string {
	return `<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Palette, ExternalLink } from 'lucide-svelte';

	let showTab = $derived($page.url.searchParams.get('theme_forseen') === 'true');

	function enablePreview() {
		goto('?theme_forseen=true', { replaceState: true });
	}

	function disablePreview() {
		goto($page.url.pathname, { replaceState: true });
	}
</script>

<svelte:head>
	<title>Theme Preview</title>
	<meta name="description" content="Live theme and font preview powered by ThemeForseen" />
</svelte:head>

<div class="min-h-screen p-8" style="background-color: var(--color-bg, #ffffff); color: var(--color-text, #333333);">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold mb-4" style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);">
			Theme Preview
		</h1>
		<p class="mb-8" style="font-family: var(--font-body, system-ui, sans-serif);">
			Powered by <a href="https://www.themeforseen.com" target="_blank" class="underline" style="color: var(--color-accent, #F72585);">ThemeForseen</a>
		</p>

		{#if !showTab}
			<button onclick={enablePreview} class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer" style="background-color: var(--color-primary, #7209B7); color: white;">
				<Palette class="w-5 h-5" />
				Enable Theme Preview Mode
			</button>
			<p class="text-sm mt-3 opacity-70">
				Or add <code class="px-2 py-1 rounded" style="background-color: var(--color-card-bg, #F8F0FF);">?theme_forseen=true</code> to any URL
			</p>
		{:else}
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style="background-color: var(--color-card-bg, #F8F0FF);">
				<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
				Theme Preview Mode Active
				<button onclick={disablePreview} class="ml-2 opacity-60 hover:opacity-100 cursor-pointer">&times;</button>
			</div>
		{/if}

		<!-- Demo Cards -->
		<div class="grid md:grid-cols-2 gap-6 mt-8">
			<div class="p-6 rounded-xl" style="background-color: var(--color-card-bg, #F8F0FF);">
				<h2 class="text-2xl font-semibold mb-3" style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);">
					Sample Card
				</h2>
				<p style="font-family: var(--font-body, system-ui, sans-serif);">
					This card demonstrates how your content will look with the selected theme.
				</p>
				<button class="mt-4 px-4 py-2 rounded-lg cursor-pointer" style="background-color: var(--color-accent, #F72585); color: white;">
					Action Button
				</button>
			</div>
			<div class="p-6 rounded-xl" style="background-color: var(--color-card-bg, #F8F0FF);">
				<h2 class="text-2xl font-semibold mb-3" style="font-family: var(--font-heading, Georgia, serif); color: var(--color-accent, #F72585);">
					Another Card
				</h2>
				<p style="font-family: var(--font-body, system-ui, sans-serif);">
					Font pairings affect readability and personality.
				</p>
				<div class="mt-4 flex gap-2">
					<span class="px-3 py-1 rounded-full text-sm" style="background-color: var(--color-extra, #4CC9F0); color: white;">Tag One</span>
					<span class="px-3 py-1 rounded-full text-sm" style="background-color: var(--color-primary-shadow, #560BAD); color: white;">Tag Two</span>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="mt-8 p-6 rounded-xl" style="background-color: var(--color-card-bg, #F8F0FF);">
			<h3 class="text-xl font-semibold mb-4" style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);">
				How It Works
			</h3>
			<ol class="list-decimal list-inside space-y-2">
				<li>Add <code class="px-1 rounded" style="background-color: var(--color-bg);">?theme_forseen=true</code> to any URL</li>
				<li>Click the palette tab on the right side</li>
				<li>Browse color palettes and font pairings</li>
				<li>See changes applied live to your site</li>
			</ol>
			<a href="https://www.themeforseen.com" target="_blank" class="inline-flex items-center gap-1 mt-4 underline" style="color: var(--color-accent, #F72585);">
				Learn more <ExternalLink class="w-4 h-4" />
			</a>
		</div>
	</div>
</div>
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const themePreviewModule: FeatureModule = {
	name: 'theme-preview',
	async apply(config: ProjectConfig, outputDir: string) {
		console.log('  → Adding ThemeForseen theme preview module');

		// Create ThemeForseen component directory
		const componentDir = join(outputDir, 'src', 'lib', 'components', 'ThemeForseen');
		await mkdir(componentDir, { recursive: true });

		// Write ThemeForseen component
		await writeFile(join(componentDir, 'ThemeForseen.svelte'), getThemeForseenComponent());

		// Write index.ts
		await writeFile(
			join(componentDir, 'index.ts'),
			`export { default as ThemeForseen } from './ThemeForseen.svelte';\n`
		);

		// Create theme-preview route directory
		const routeDir = join(outputDir, 'src', 'routes', 'theme-preview');
		await mkdir(routeDir, { recursive: true });

		// Write theme-preview page
		await writeFile(join(routeDir, '+page.svelte'), getThemePreviewPage());

		// Update the root layout to include ThemeForseen component
		const layoutPath = join(outputDir, 'src', 'routes', '+layout.svelte');
		try {
			let layoutContent = await readFile(layoutPath, 'utf-8');

			// Check if ThemeForseen is already imported
			if (!layoutContent.includes('ThemeForseen')) {
				// Add import
				if (layoutContent.includes('<script')) {
					layoutContent = layoutContent.replace(
						/<script([^>]*)>/,
						`<script$1>\n\timport { ThemeForseen } from '$lib/components/ThemeForseen';`
					);
				}

				// Add component before closing slot or at end
				if (layoutContent.includes('</slot>')) {
					layoutContent = layoutContent.replace('</slot>', '</slot>\n<ThemeForseen />');
				} else if (layoutContent.includes('{@render children()}')) {
					layoutContent = layoutContent.replace(
						'{@render children()}',
						'{@render children()}\n<ThemeForseen />'
					);
				}

				await writeFile(layoutPath, layoutContent);
			}
		} catch {
			// Layout doesn't exist, will be created by base generator
		}

		// Add dependencies
		const packageJsonPath = join(outputDir, 'package.json');
		try {
			const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

			packageJson.dependencies = {
				...packageJson.dependencies,
				'lucide-svelte': '^0.468.0'
			};

			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {
			// Package.json doesn't exist, skip
		}

		console.log('  → ThemeForseen component added to $lib/components/ThemeForseen');
		console.log('  → Demo page created at /theme-preview');
		console.log('  → Add ?theme_forseen=true to any URL to enable preview mode');
	}
};
