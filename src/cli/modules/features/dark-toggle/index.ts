import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

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

		if (stored && (mode === 'light-dark-system' || stored !== 'system')) {
			theme = stored;
		} else if (mode === 'light-dark-system') {
			theme = 'system';
		} else {
			theme = 'light';
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
		'p-2 rounded-md text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer',
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
@theme {
	/* Border radius */
	--radius: 0.5rem;
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);

	/* Colors - Light mode defaults */
	--color-background: hsl(0 0% 100%);
	--color-foreground: hsl(240 10% 3.9%);

	--color-card: hsl(0 0% 100%);
	--color-card-foreground: hsl(240 10% 3.9%);

	--color-popover: hsl(0 0% 100%);
	--color-popover-foreground: hsl(240 10% 3.9%);

	--color-primary: hsl(240 5.9% 10%);
	--color-primary-foreground: hsl(0 0% 98%);

	--color-secondary: hsl(240 4.8% 95.9%);
	--color-secondary-foreground: hsl(240 5.9% 10%);

	--color-muted: hsl(240 4.8% 95.9%);
	--color-muted-foreground: hsl(240 3.8% 46.1%);

	--color-accent: hsl(240 4.8% 95.9%);
	--color-accent-foreground: hsl(240 5.9% 10%);

	--color-destructive: hsl(0 84.2% 60.2%);
	--color-destructive-foreground: hsl(0 0% 98%);

	--color-border: hsl(240 5.9% 90%);
	--color-input: hsl(240 5.9% 90%);
	--color-ring: hsl(240 5.9% 10%);

	/* Animations */
	--animate-accordion-down: accordion-down 0.2s ease-out;
	--animate-accordion-up: accordion-up 0.2s ease-out;

	@keyframes accordion-down {
		from {
			height: 0;
		}
		to {
			height: var(--bits-accordion-content-height);
		}
	}

	@keyframes accordion-up {
		from {
			height: var(--bits-accordion-content-height);
		}
		to {
			height: 0;
		}
	}
}

/* Dark mode overrides */
.dark {
	--color-background: hsl(240 10% 3.9%);
	--color-foreground: hsl(0 0% 98%);

	--color-card: hsl(240 10% 3.9%);
	--color-card-foreground: hsl(0 0% 98%);

	--color-popover: hsl(240 10% 3.9%);
	--color-popover-foreground: hsl(0 0% 98%);

	--color-primary: hsl(0 0% 98%);
	--color-primary-foreground: hsl(240 5.9% 10%);

	--color-secondary: hsl(240 3.7% 15.9%);
	--color-secondary-foreground: hsl(0 0% 98%);

	--color-muted: hsl(240 3.7% 15.9%);
	--color-muted-foreground: hsl(240 5% 64.9%);

	--color-accent: hsl(240 3.7% 15.9%);
	--color-accent-foreground: hsl(0 0% 98%);

	--color-destructive: hsl(0 62.8% 30.6%);
	--color-destructive-foreground: hsl(0 0% 98%);

	--color-border: hsl(240 3.7% 15.9%);
	--color-input: hsl(240 3.7% 15.9%);
	--color-ring: hsl(240 4.9% 83.9%);
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
			hsl(240 10% 3.9%);
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

				// Check if Nav component is used and add showThemeToggle prop
				if (layout.includes('<Nav') && !layout.includes('showThemeToggle')) {
					// Add showThemeToggle prop to Nav component
					layout = layout.replace(
						/<Nav(\s)/,
						`<Nav showThemeToggle={true} themeToggleMode="${mode}"$1`
					);

					// If Nav is self-closing with no attributes
					layout = layout.replace(
						/<Nav\s*\/>/,
						`<Nav showThemeToggle={true} themeToggleMode="${mode}" />`
					);

					await writeFile(layoutPath, layout);
					console.log(`  → Updated ${layoutPath.replace(outputDir, '')}`);
				}
			} catch {
				// Layout file doesn't exist, skip
			}
		}

		// Add lucide-svelte dependency if not present
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

		console.log('  → Theme toggle module created successfully');
		console.log(`  → Toggle mode: ${mode === 'light-dark' ? 'Light/Dark only' : 'Light/Dark/System'}`);
	}
};
