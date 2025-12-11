import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { ProjectConfig, FeatureModule } from '../../types';

// ============================================================================
// UTILS FILE (cn helper for class merging)
// ============================================================================

function getUtilsFile(): string {
	return `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
`;
}

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

function getThemeToggleComponent(): string {
	return `<script lang="ts" module>
	export type ThemeMode = 'light' | 'dark' | 'system';
	export type ToggleMode = 'light-dark' | 'light-dark-system';
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		mode?: ToggleMode;
		class?: string;
	}

	let { mode = 'light-dark-system', class: className, ...restProps }: Props = $props();

	let theme = $state<ThemeMode>('light');
	let mounted = $state(false);

	const STORAGE_KEY = 'theme';

	function getSystemTheme(): 'light' | 'dark' {
		if (typeof window === 'undefined') return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(t: ThemeMode) {
		if (typeof document === 'undefined') return;

		const effectiveTheme = t === 'system' ? getSystemTheme() : t;

		if (effectiveTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function cycleTheme() {
		if (mode === 'light-dark') {
			theme = theme === 'light' ? 'dark' : 'light';
		} else {
			// light -> dark -> system -> light
			if (theme === 'light') theme = 'dark';
			else if (theme === 'dark') theme = 'system';
			else theme = 'light';
		}

		localStorage.setItem(STORAGE_KEY, theme);
		applyTheme(theme);
	}

	onMount(() => {
		// Get stored theme or default to system (for 3-state) or light (for 2-state)
		const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;

		if (stored) {
			if (mode === 'light-dark' && stored === 'system') {
				// 2-state toggle: resolve 'system' to actual preference
				theme = getSystemTheme();
			} else if (mode === 'light-dark-system' || stored !== 'system') {
				theme = stored;
			} else {
				theme = 'light';
			}
		} else if (mode === 'light-dark-system') {
			theme = 'system';
		} else {
			// 2-state toggle with no stored value: respect system preference
			theme = getSystemTheme();
		}

		applyTheme(theme);
		mounted = true;

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		};
		mediaQuery.addEventListener('change', handleChange);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	});

	// Get tooltip text
	const tooltip = $derived(() => {
		if (theme === 'light') return 'Light mode';
		if (theme === 'dark') return 'Dark mode';
		return 'System preference';
	});
</script>

<button
	type="button"
	onclick={cycleTheme}
	class={cn(
		'p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
		className
	)}
	title={tooltip()}
	aria-label={tooltip()}
	data-testid="theme-toggle"
	{...restProps}
>
	{#if !mounted}
		<!-- Placeholder to prevent layout shift -->
		<div class="w-5 h-5"></div>
	{:else if theme === 'light'}
		<Sun class="w-5 h-5" />
	{:else if theme === 'dark'}
		<Moon class="w-5 h-5" />
	{:else}
		<Monitor class="w-5 h-5" />
	{/if}
</button>
`;
}

function getThemeToggleIndex(): string {
	return `import Root from './ThemeToggle.svelte';

export {
	Root,
	Root as ThemeToggle
};
`;
}

// ============================================================================
// DARK MODE CSS (Tailwind v4 style)
// ============================================================================

function getDarkModeCSS(): string {
	return `/* Dark mode CSS variables - Tailwind v4 style */
:root {
	/* Border radius */
	--app-radius: 0.5rem;
	--app-radius-sm: calc(var(--app-radius) - 4px);
	--app-radius-md: calc(var(--app-radius) - 2px);
	--app-radius-lg: var(--app-radius);
	--app-radius-xl: calc(var(--app-radius) + 4px);

	/* Colors - Light mode defaults */
	--app-background: hsl(0 0% 100%);
	--app-foreground: hsl(240 10% 3.9%);
	--app-card: hsl(0 0% 100%);
	--app-card-foreground: hsl(240 10% 3.9%);
	--app-popover: hsl(0 0% 100%);
	--app-popover-foreground: hsl(240 10% 3.9%);
	--app-primary: hsl(240 5.9% 10%);
	--app-primary-foreground: hsl(0 0% 98%);
	--app-secondary: hsl(240 4.8% 95.9%);
	--app-secondary-foreground: hsl(240 5.9% 10%);
	--app-muted: hsl(240 4.8% 95.9%);
	--app-muted-foreground: hsl(240 3.8% 46.1%);
	--app-accent: hsl(240 4.8% 95.9%);
	--app-accent-foreground: hsl(240 5.9% 10%);
	--app-destructive: hsl(0 84.2% 60.2%);
	--app-destructive-foreground: hsl(0 0% 98%);
	--app-border: hsl(240 5.9% 90%);
	--app-input: hsl(240 5.9% 90%);
	--app-ring: hsl(240 5.9% 10%);

	/* ThemeForseen-compatible CSS variables (for live theme preview) */
	--color-bg: hsl(0 0% 100%);
	--color-text: hsl(240 10% 3.9%);
	--color-primary: hsl(240 5.9% 10%);
	--color-accent: hsl(240 4.8% 95.9%);
	--color-card-bg: hsl(240 4.8% 95.9%);
	--color-extra: hsl(200 80% 60%);
	--color-primary-shadow: hsl(240 5.9% 5%);
	--font-heading: "Geist Variable", Georgia, serif;
	--font-body: "Inter", system-ui, sans-serif;

	/* Animations */
	--app-animate-accordion-down: accordion-down 0.2s ease-out;
	--app-animate-accordion-up: accordion-up 0.2s ease-out;
}

/* Dark mode overrides */
.dark {
	--app-background: hsl(240 10% 3.9%);
	--app-foreground: hsl(0 0% 98%);
	--app-card: hsl(240 10% 3.9%);
	--app-card-foreground: hsl(0 0% 98%);
	--app-popover: hsl(240 10% 3.9%);
	--app-popover-foreground: hsl(0 0% 98%);
	--app-primary: hsl(0 0% 98%);
	--app-primary-foreground: hsl(240 5.9% 10%);
	--app-secondary: hsl(240 3.7% 15.9%);
	--app-secondary-foreground: hsl(0 0% 98%);
	--app-muted: hsl(240 3.7% 15.9%);
	--app-muted-foreground: hsl(240 5% 64.9%);
	--app-accent: hsl(240 3.7% 15.9%);
	--app-accent-foreground: hsl(0 0% 98%);
	--app-destructive: hsl(0 62.8% 30.6%);
	--app-destructive-foreground: hsl(0 0% 98%);
	--app-border: hsl(240 3.7% 15.9%);
	--app-input: hsl(240 3.7% 15.9%);
	--app-ring: hsl(240 4.9% 83.9%);

	/* ThemeForseen-compatible CSS variables (dark mode) */
	--color-bg: hsl(240 10% 3.9%);
	--color-text: hsl(0 0% 98%);
	--color-primary: hsl(0 0% 98%);
	--color-accent: hsl(240 3.7% 15.9%);
	--color-card-bg: hsl(240 3.7% 15.9%);
	--color-extra: hsl(200 70% 50%);
	--color-primary-shadow: hsl(240 10% 8%);
}

/* Keyframe animations */
@keyframes accordion-down {
	from { height: 0; }
	to { height: var(--bits-accordion-content-height); }
}

@keyframes accordion-up {
	from { height: var(--bits-accordion-content-height); }
	to { height: 0; }
}

/* Tailwind v4 theme - reference CSS variables */
@theme inline {
	--color-background: var(--app-background);
	--color-foreground: var(--app-foreground);
	--color-card: var(--app-card);
	--color-card-foreground: var(--app-card-foreground);
	--color-popover: var(--app-popover);
	--color-popover-foreground: var(--app-popover-foreground);
	--color-primary: var(--app-primary);
	--color-primary-foreground: var(--app-primary-foreground);
	--color-secondary: var(--app-secondary);
	--color-secondary-foreground: var(--app-secondary-foreground);
	--color-muted: var(--app-muted);
	--color-muted-foreground: var(--app-muted-foreground);
	--color-accent: var(--app-accent);
	--color-accent-foreground: var(--app-accent-foreground);
	--color-destructive: var(--app-destructive);
	--color-destructive-foreground: var(--app-destructive-foreground);
	--color-border: var(--app-border);
	--color-input: var(--app-input);
	--color-ring: var(--app-ring);
	--radius: var(--app-radius);
	--radius-sm: var(--app-radius-sm);
	--radius-md: var(--app-radius-md);
	--radius-lg: var(--app-radius-lg);
	--radius-xl: var(--app-radius-xl);
	--animate-accordion-down: var(--app-animate-accordion-down);
	--animate-accordion-up: var(--app-animate-accordion-up);
}

/* Base dark mode styles */
@layer base {
	* {
		@apply border-border;
	}

	body {
		@apply bg-background text-foreground;
	}

	.dark body {
		/* Dark mode background with subtle grid */
		background:
			linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
			linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
			var(--app-background);
		background-size: 48px 48px;
	}
}
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const darkToggleModule: FeatureModule = {
	name: 'dark-toggle',
	async apply(config: ProjectConfig, outputDir: string) {
		const mode = config.darkToggle?.mode || 'light-dark-system';

		console.log(`  → Adding dark/light theme toggle (${mode} mode)`);

		// Create lib directory and utils file if it doesn't exist
		await mkdir(join(outputDir, 'src', 'lib'), { recursive: true });
		const utilsPath = join(outputDir, 'src', 'lib', 'utils.ts');
		if (!existsSync(utilsPath)) {
			await writeFile(utilsPath, getUtilsFile());
		}

		// Create theme-toggle component directory
		await mkdir(join(outputDir, 'src', 'lib', 'components', 'ui', 'theme-toggle'), { recursive: true });

		// Write ThemeToggle component
		await writeFile(
			join(outputDir, 'src', 'lib', 'components', 'ui', 'theme-toggle', 'ThemeToggle.svelte'),
			getThemeToggleComponent()
		);
		await writeFile(
			join(outputDir, 'src', 'lib', 'components', 'ui', 'theme-toggle', 'index.ts'),
			getThemeToggleIndex()
		);

		// Update UI components index to export ThemeToggle
		const uiIndexPath = join(outputDir, 'src', 'lib', 'components', 'ui', 'index.ts');
		try {
			let uiIndex = await readFile(uiIndexPath, 'utf-8');
			if (!uiIndex.includes('theme-toggle')) {
				uiIndex += `\nexport * as ThemeToggle from './theme-toggle';\n`;
				await writeFile(uiIndexPath, uiIndex);
			}
		} catch {
			// Create index if it doesn't exist
			await writeFile(uiIndexPath, `export * as ThemeToggle from './theme-toggle';\n`);
		}

		// Check if app.css exists and update it with dark mode CSS if needed
		const appCssPath = join(outputDir, 'src', 'app.css');
		try {
			let appCss = await readFile(appCssPath, 'utf-8');
			// Check if dark mode CSS is already present
			if (!appCss.includes('.dark {') && !appCss.includes('.dark{')) {
				// Add dark mode CSS after @import 'tailwindcss';
				if (appCss.includes("@import 'tailwindcss';")) {
					appCss = appCss.replace(
						"@import 'tailwindcss';",
						`@import 'tailwindcss';\n\n${getDarkModeCSS()}`
					);
				} else {
					// Just append the dark mode CSS
					appCss += `\n${getDarkModeCSS()}`;
				}
				await writeFile(appCssPath, appCss);
			}
		} catch {
			// Create app.css with dark mode CSS
			await writeFile(appCssPath, `@import 'tailwindcss';\n\n${getDarkModeCSS()}`);
		}

		// Update the layout to enable theme toggle in Nav
		// Look for +layout.svelte files and add showThemeToggle prop
		const layoutFiles = [
			join(outputDir, 'src', 'routes', '+layout.svelte'),
			join(outputDir, 'src', 'routes', '(app)', '+layout.svelte')
		];

		for (const layoutPath of layoutFiles) {
			try {
				let layout = await readFile(layoutPath, 'utf-8');
				let updated = false;

				// Check if Nav component is used and add showThemeToggle prop
				if (layout.includes('<Nav') && !layout.includes('showThemeToggle')) {
					// Add showThemeToggle prop to Nav component (handles multiline)
					layout = layout.replace(
						/<Nav([\s\n\t]+)/,
						`<Nav showThemeToggle={true} themeToggleMode="${mode}"$1`
					);

					// If Nav is self-closing with no attributes
					layout = layout.replace(
						/<Nav\s*\/>/,
						`<Nav showThemeToggle={true} themeToggleMode="${mode}" />`
					);

					updated = true;
				}

				// Handle inline headers (generated by getHeader in ssr-site/static-site)
				// Look for <!-- Desktop Nav --> pattern and inject ThemeToggle
				if (layout.includes('<!-- Desktop Nav -->') && !layout.includes('ThemeToggle')) {
					// Add import for ThemeToggle
					if (layout.includes('<script lang="ts">')) {
						layout = layout.replace(
							'<script lang="ts">',
							`<script lang="ts">\n\timport { ThemeToggle } from '$lib/components/ui/theme-toggle';`
						);
					}

					// Inject ThemeToggle inside the desktop nav wrapper div (at the end, before closing </div>)
					// The structure is: <div class="hidden md:flex items-center gap-4"><nav>...</nav>[optional auth section]</div>
					// We match from the opening div to the closing </div> that's followed by <!-- Mobile Hamburger -->
					layout = layout.replace(
						/(<div class="hidden md:flex items-center gap-4">[\s\S]*?)(\s*<\/div>\s*\n\s*<!-- Mobile Hamburger -->)/,
						`$1\n\t\t\t<ThemeToggle mode="${mode}" />$2`
					);

					updated = true;
				}

				if (updated) {
					await writeFile(layoutPath, layout);
					console.log(`  → Updated ${layoutPath.replace(outputDir, '')}`);
				}
			} catch {
				// Layout file doesn't exist, skip
			}
		}

		// Add required dependencies if not present
		const packageJsonPath = join(outputDir, 'package.json');
		try {
			const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

			packageJson.dependencies = {
				...packageJson.dependencies,
				'clsx': '^2.1.1',
				'lucide-svelte': '^0.468.0',
				'tailwind-merge': '^3.0.2'
			};

			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {
			// Package.json doesn't exist, skip
		}

		console.log('  → Theme toggle module created successfully');
		console.log(`  → Toggle mode: ${mode === 'light-dark' ? 'Light/Dark only' : 'Light/Dark/System'}`);
	}
};
