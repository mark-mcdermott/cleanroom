<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Palette, Type, X, ChevronRight, Sun, Moon, Sparkles, ExternalLink, Zap } from 'lucide-svelte';

	// Color themes from ThemeForseen
	const colorThemes = [
		{
			name: 'Ocean Blue',
			tags: ['corporate'],
			light: {
				primary: '#0066CC',
				primaryShadow: '#004C99',
				accent: '#FF6B35',
				accentShadow: '#CC5529',
				background: '#FFFFFF',
				cardBackground: '#F5F5F5',
				text: '#333333',
				extra: '#00D4FF'
			},
			dark: {
				primary: '#3399FF',
				primaryShadow: '#0066CC',
				accent: '#FF8C5A',
				accentShadow: '#FF6B35',
				background: '#1A1A1A',
				cardBackground: '#2A2A2A',
				text: '#E0E0E0',
				extra: '#00D4FF'
			}
		},
		{
			name: 'Forest Green',
			tags: ['nature'],
			light: {
				primary: '#2D6A4F',
				primaryShadow: '#1B4332',
				accent: '#D4A373',
				accentShadow: '#B8865B',
				background: '#FEFEFE',
				cardBackground: '#F1FAEE',
				text: '#1B4332',
				extra: '#52B788'
			},
			dark: {
				primary: '#52B788',
				primaryShadow: '#2D6A4F',
				accent: '#E9C46A',
				accentShadow: '#D4A373',
				background: '#1B1B1B',
				cardBackground: '#2D3E2F',
				text: '#E8F3E8',
				extra: '#95D5B2'
			}
		},
		{
			name: 'Sunset Pink',
			tags: ['funky'],
			light: {
				primary: '#E63946',
				primaryShadow: '#C5303D',
				accent: '#FFB703',
				accentShadow: '#DC9F02',
				background: '#FFFFFF',
				cardBackground: '#FFF3F3',
				text: '#2B2D42',
				extra: '#FB5607'
			},
			dark: {
				primary: '#FF5A67',
				primaryShadow: '#E63946',
				accent: '#FFD60A',
				accentShadow: '#FFB703',
				background: '#1A1A2E',
				cardBackground: '#2B2D42',
				text: '#EDF2F4',
				extra: '#FB5607'
			}
		},
		{
			name: 'Purple Dream',
			tags: ['funky'],
			light: {
				primary: '#7209B7',
				primaryShadow: '#560BAD',
				accent: '#F72585',
				accentShadow: '#D90368',
				background: '#FFFFFF',
				cardBackground: '#F8F0FF',
				text: '#2B2D42',
				extra: '#4CC9F0'
			},
			dark: {
				primary: '#B388FF',
				primaryShadow: '#7209B7',
				accent: '#FF4DA6',
				accentShadow: '#F72585',
				background: '#1A1A2E',
				cardBackground: '#2D2A3E',
				text: '#E0E0E0',
				extra: '#4CC9F0'
			}
		},
		{
			name: 'Midnight Blue',
			tags: ['corporate'],
			light: {
				primary: '#1A365D',
				primaryShadow: '#0D1B2A',
				accent: '#E07A5F',
				accentShadow: '#C96248',
				background: '#FFFFFF',
				cardBackground: '#F7FAFC',
				text: '#2D3748',
				extra: '#4A5568'
			},
			dark: {
				primary: '#63B3ED',
				primaryShadow: '#4299E1',
				accent: '#FC8181',
				accentShadow: '#F56565',
				background: '#1A202C',
				cardBackground: '#2D3748',
				text: '#E2E8F0',
				extra: '#718096'
			}
		},
		{
			name: 'Coral Reef',
			tags: ['funky', 'nature'],
			light: {
				primary: '#FF6B6B',
				primaryShadow: '#EE5A5A',
				accent: '#4ECDC4',
				accentShadow: '#3DBDB5',
				background: '#FFFFFF',
				cardBackground: '#FFF5F5',
				text: '#2C3E50',
				extra: '#FFE66D'
			},
			dark: {
				primary: '#FF8787',
				primaryShadow: '#FF6B6B',
				accent: '#63E2D9',
				accentShadow: '#4ECDC4',
				background: '#1A1A2E',
				cardBackground: '#2E2E42',
				text: '#ECF0F1',
				extra: '#FFE66D'
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

	// Apply theme to CSS variables
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

	// Apply fonts
	function applyFonts(fontIndex: number) {
		if (!browser) return;
		const font = fontPairings[fontIndex];
		document.documentElement.style.setProperty('--font-heading', font.heading);
		document.documentElement.style.setProperty('--font-body', font.body);
	}

	// Toggle drawer
	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	// Select theme
	function selectTheme(index: number) {
		selectedThemeIndex = index;
		applyTheme(index);
	}

	// Select font
	function selectFont(index: number) {
		selectedFontIndex = index;
		applyFonts(index);
	}

	// Toggle dark mode
	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		applyTheme(selectedThemeIndex);
	}

	// Enable theme preview mode
	function enablePreview() {
		goto('?theme_forseen=true', { replaceState: true });
	}

	// Disable theme preview mode
	function disablePreview() {
		goto($page.url.pathname, { replaceState: true });
		isDrawerOpen = false;
	}

	// Initialize on mount
	onMount(() => {
		// Check system dark mode preference
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		applyTheme(selectedThemeIndex);
		applyFonts(selectedFontIndex);
	});

	// Get current theme colors for preview
	let currentTheme = $derived(colorThemes[selectedThemeIndex]);
	let currentColors = $derived(isDarkMode ? currentTheme.dark : currentTheme.light);
	let currentFont = $derived(fontPairings[selectedFontIndex]);
</script>

<svelte:head>
	<title>Theme Preview - Module Demo</title>
	<meta name="description" content="Live theme and font preview tool powered by ThemeForseen" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@400;700&family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@400;600&family=Poppins:wght@400;500;600;700&family=Nunito:wght@400;600&family=Merriweather:wght@400;700&family=Source+Sans+Pro:wght@400;600&family=JetBrains+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="min-h-screen transition-colors duration-300"
	style="background-color: var(--color-bg, #ffffff); color: var(--color-text, #333333);"
>
	<div class="max-w-4xl mx-auto px-6 py-12">
		<!-- Header -->
		<div class="text-center mb-12">
			<div class="flex items-center justify-center gap-3 mb-4">
				<Sparkles class="w-10 h-10" style="color: var(--color-primary, #7209B7);" />
				<h1
					class="text-4xl font-bold"
					style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);"
				>
					Theme Preview
				</h1>
			</div>
			<p style="font-family: var(--font-body, system-ui, sans-serif);">
				Powered by <a
					href="https://www.themeforseen.com"
					target="_blank"
					class="underline hover:opacity-80"
					style="color: var(--color-accent, #F72585);">ThemeForseen</a
				>
				- Live theme and font preview tool
			</p>
		</div>

		<!-- Enable Preview Button -->
		{#if !showTab}
			<div class="text-center mb-8">
				<button
					onclick={enablePreview}
					class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 cursor-pointer"
					style="background-color: var(--color-primary, #7209B7); color: white;"
				>
					<Palette class="w-5 h-5" />
					Enable Theme Preview Mode
				</button>
				<p class="text-sm mt-3 opacity-70">
					Or add <code class="px-2 py-1 rounded" style="background-color: var(--color-card-bg, #F8F0FF);">?theme_forseen=true</code> to any URL
				</p>
			</div>
		{:else}
			<div class="text-center mb-8">
				<div
					class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
					style="background-color: var(--color-card-bg, #F8F0FF);"
				>
					<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
					Theme Preview Mode Active
					<button onclick={disablePreview} class="ml-2 opacity-60 hover:opacity-100 cursor-pointer">
						<X class="w-4 h-4" />
					</button>
				</div>
			</div>
		{/if}

		<!-- Demo Content -->
		<div class="space-y-8">
			<!-- Cards -->
			<div class="grid md:grid-cols-2 gap-6">
				<div
					class="p-6 rounded-xl shadow-sm"
					style="background-color: var(--color-card-bg, #F8F0FF);"
				>
					<h2
						class="text-2xl font-semibold mb-3"
						style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);"
					>
						Sample Card
					</h2>
					<p style="font-family: var(--font-body, system-ui, sans-serif);">
						This card demonstrates how your content will look with the selected theme. Watch it
						change as you browse different color palettes!
					</p>
					<button
						class="mt-4 px-4 py-2 rounded-lg transition-colors cursor-pointer"
						style="background-color: var(--color-accent, #F72585); color: white;"
					>
						Action Button
					</button>
				</div>

				<div
					class="p-6 rounded-xl shadow-sm"
					style="background-color: var(--color-card-bg, #F8F0FF);"
				>
					<h2
						class="text-2xl font-semibold mb-3"
						style="font-family: var(--font-heading, Georgia, serif); color: var(--color-accent, #F72585);"
					>
						Another Card
					</h2>
					<p style="font-family: var(--font-body, system-ui, sans-serif);">
						Font pairings affect readability and personality. The heading and body fonts work
						together to create visual hierarchy.
					</p>
					<div class="mt-4 flex gap-2">
						<span
							class="px-3 py-1 rounded-full text-sm"
							style="background-color: var(--color-extra, #4CC9F0); color: white;"
						>
							Tag One
						</span>
						<span
							class="px-3 py-1 rounded-full text-sm"
							style="background-color: var(--color-primary-shadow, #560BAD); color: white;"
						>
							Tag Two
						</span>
					</div>
				</div>
			</div>

			<!-- Typography Demo -->
			<div class="p-6 rounded-xl" style="background-color: var(--color-card-bg, #F8F0FF);">
				<h3
					class="text-xl font-semibold mb-4"
					style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);"
				>
					Typography Preview
				</h3>
				<div class="space-y-3" style="font-family: var(--font-body, system-ui, sans-serif);">
					<p class="text-lg">
						<strong>Heading Font:</strong>
						<span style="font-family: var(--font-heading, Georgia, serif);">{currentFont.name}</span>
					</p>
					<p class="text-lg">
						<strong>Body Font:</strong> The quick brown fox jumps over the lazy dog.
					</p>
					<p class="opacity-70">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua.
					</p>
				</div>
			</div>

			<!-- Current Theme Info -->
			<div class="p-6 rounded-xl border" style="border-color: var(--color-primary, #7209B7);">
				<h3
					class="text-xl font-semibold mb-4"
					style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);"
				>
					Current Selection
				</h3>
				<div class="grid md:grid-cols-2 gap-4">
					<div>
						<p class="font-medium mb-2">Color Theme: {currentTheme.name}</p>
						<div class="flex gap-2">
							<div
								class="w-8 h-8 rounded"
								style="background-color: {currentColors.primary};"
								title="Primary"
							></div>
							<div
								class="w-8 h-8 rounded"
								style="background-color: {currentColors.accent};"
								title="Accent"
							></div>
							<div
								class="w-8 h-8 rounded border"
								style="background-color: {currentColors.background};"
								title="Background"
							></div>
							<div
								class="w-8 h-8 rounded"
								style="background-color: {currentColors.extra};"
								title="Extra"
							></div>
						</div>
					</div>
					<div>
						<p class="font-medium mb-2">Font Pairing: {currentFont.name}</p>
						<p class="text-sm opacity-70">
							Heading: {currentFont.heading.split(',')[0]}<br />
							Body: {currentFont.body.split(',')[0]}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="mt-12 p-6 rounded-xl" style="background-color: var(--color-card-bg, #F8F0FF);">
			<h2
				class="text-2xl font-semibold mb-4"
				style="font-family: var(--font-heading, Georgia, serif); color: var(--color-primary, #7209B7);"
			>
				How It Works
			</h2>
			<div class="space-y-4" style="font-family: var(--font-body, system-ui, sans-serif);">
				<p>
					ThemeForseen adds a collapsible sidebar to your site that lets you preview different color
					themes and font pairings in real-time.
				</p>
				<ol class="list-decimal list-inside space-y-2 ml-4">
					<li>Add <code class="px-1 rounded" style="background-color: var(--color-bg);">?theme_forseen=true</code> to any URL to enable preview mode</li>
					<li>Click the tab on the right side to open the theme drawer</li>
					<li>Browse color palettes and font pairings</li>
					<li>See changes applied live to your entire site</li>
					<li>When you find one you like, export the CSS variables to your project</li>
				</ol>
				<p class="mt-4">
					<a
						href="https://www.themeforseen.com"
						target="_blank"
						class="inline-flex items-center gap-1 underline"
						style="color: var(--color-accent, #F72585);"
					>
						Learn more at themeforseen.com
						<ExternalLink class="w-4 h-4" />
					</a>
				</p>
			</div>
		</div>
	</div>

	<!-- ThemeForseen Tab (shows only with query param) -->
	{#if showTab}
		<button
			onclick={toggleDrawer}
			class="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-l-lg shadow-lg transition-transform hover:translate-x-0 cursor-pointer {isDrawerOpen ? 'translate-x-full' : 'translate-x-0'}"
			style="background-color: var(--color-primary, #7209B7); color: white;"
			aria-label="Toggle theme drawer"
		>
			<Palette class="w-6 h-6" />
		</button>

		<!-- Drawer -->
		<div
			class="fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 shadow-2xl overflow-hidden {isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}"
			style="background-color: var(--color-bg, #ffffff);"
		>
			<!-- Drawer Header -->
			<div
				class="flex items-center justify-between p-4 border-b"
				style="border-color: var(--color-card-bg, #F8F0FF);"
			>
				<div class="flex items-center gap-2">
					<Sparkles class="w-5 h-5" style="color: var(--color-primary, #7209B7);" />
					<span class="font-semibold" style="font-family: var(--font-heading, Georgia, serif);"
						>ThemeForseen</span
					>
				</div>
				<div class="flex items-center gap-2">
					<button
						onclick={toggleDarkMode}
						class="p-2 rounded-lg transition-colors cursor-pointer hover:opacity-80"
						style="background-color: var(--color-card-bg, #F8F0FF);"
						title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						{#if isDarkMode}
							<Sun class="w-4 h-4" />
						{:else}
							<Moon class="w-4 h-4" />
						{/if}
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
					class="flex-1 p-3 flex items-center justify-center gap-2 transition-colors cursor-pointer {activeTab === 'colors' ? 'border-b-2' : 'opacity-60'}"
					style={activeTab === 'colors' ? `border-color: var(--color-primary, #7209B7);` : ''}
				>
					<Palette class="w-4 h-4" />
					Colors
				</button>
				<button
					onclick={() => (activeTab = 'fonts')}
					class="flex-1 p-3 flex items-center justify-center gap-2 transition-colors cursor-pointer {activeTab === 'fonts' ? 'border-b-2' : 'opacity-60'}"
					style={activeTab === 'fonts' ? `border-color: var(--color-primary, #7209B7);` : ''}
				>
					<Type class="w-4 h-4" />
					Fonts
				</button>
			</div>

			<!-- Drawer Content -->
			<div class="p-4 overflow-y-auto" style="height: calc(100% - 120px);">
				{#if activeTab === 'colors'}
					<div class="space-y-3">
						{#each colorThemes as theme, index}
							{@const colors = isDarkMode ? theme.dark : theme.light}
							<button
								onclick={() => selectTheme(index)}
								class="w-full p-4 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02] {selectedThemeIndex === index ? 'ring-2' : ''}"
								style="background-color: var(--color-card-bg, #F8F0FF); {selectedThemeIndex === index ? `ring-color: var(--color-primary, #7209B7);` : ''}"
							>
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium">{theme.name}</span>
									{#if selectedThemeIndex === index}
										<Zap class="w-4 h-4" style="color: var(--color-primary, #7209B7);" />
									{/if}
								</div>
								<div class="flex gap-1">
									<div class="w-8 h-6 rounded" style="background-color: {colors.primary};"></div>
									<div class="w-8 h-6 rounded" style="background-color: {colors.accent};"></div>
									<div
										class="w-8 h-6 rounded border"
										style="background-color: {colors.background}; border-color: {colors.text}20;"
									></div>
									<div class="w-8 h-6 rounded" style="background-color: {colors.extra};"></div>
								</div>
								{#if theme.tags}
									<div class="flex gap-1 mt-2">
										{#each theme.tags as tag}
											<span
												class="text-xs px-2 py-0.5 rounded-full opacity-60"
												style="background-color: var(--color-bg, #ffffff);"
											>
												{tag}
											</span>
										{/each}
									</div>
								{/if}
							</button>
						{/each}
					</div>
				{:else}
					<div class="space-y-3">
						{#each fontPairings as font, index}
							<button
								onclick={() => selectFont(index)}
								class="w-full p-4 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02] {selectedFontIndex === index ? 'ring-2' : ''}"
								style="background-color: var(--color-card-bg, #F8F0FF); {selectedFontIndex === index ? `ring-color: var(--color-primary, #7209B7);` : ''}"
							>
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium" style="font-family: {font.heading};">{font.name}</span>
									{#if selectedFontIndex === index}
										<Zap class="w-4 h-4" style="color: var(--color-primary, #7209B7);" />
									{/if}
								</div>
								<p class="text-sm opacity-70" style="font-family: {font.body};">
									The quick brown fox jumps over the lazy dog.
								</p>
								<p class="text-xs mt-2 opacity-50">
									{font.heading.split(',')[0]} + {font.body.split(',')[0]}
								</p>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Backdrop -->
		{#if isDrawerOpen}
			<button
				onclick={toggleDrawer}
				class="fixed inset-0 bg-black/20 z-40 cursor-pointer"
				aria-label="Close drawer"
			></button>
		{/if}
	{/if}
</div>
