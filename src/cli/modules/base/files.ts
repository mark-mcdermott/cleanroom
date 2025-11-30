import type { ProjectConfig } from '../types';

export function getPackageJson(config: ProjectConfig): string {
	const slug = slugify(config.projectName);
	return `{
  "name": "${slug}",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@sveltejs/adapter-cloudflare": "^4.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "type": "module",
  "engines": {
    "node": ">=22"
  }
}
`;
}

export function getSvelteConfig(): string {
	return `import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
`;
}

export function getViteConfig(): string {
	return `import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
`;
}

export function getTsConfig(): string {
	return `{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
}
`;
}

export function getGitignore(): string {
	return `# Dependencies
node_modules

# Build outputs
.svelte-kit
build
dist

# Environment
.env
.env.*
!.env.example
.dev.vars

# IDE
.vscode
.idea

# OS
.DS_Store
Thumbs.db

# Logs
*.log
`;
}

export function getAppCss(): string {
	return `@import "tailwindcss";

:root {
  --font-logo: "Geist Variable", system-ui, sans-serif;

  /* Colors - Light mode */
  --app-background: hsl(0 0% 100%);
  --app-foreground: hsl(240 10% 3.9%);
  --app-card: hsl(0 0% 100%);
  --app-card-foreground: hsl(240 10% 3.9%);
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
}

/* Tailwind v4 theme - reference CSS variables */
@theme inline {
  --color-background: var(--app-background);
  --color-foreground: var(--app-foreground);
  --color-card: var(--app-card);
  --color-card-foreground: var(--app-card-foreground);
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
}

@layer base {
  html {
    font-family: "Inter", system-ui, sans-serif;
    @apply antialiased bg-background text-foreground;
    scroll-behavior: smooth;
  }

  body {
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      var(--app-background);
    background-size: 48px 48px;
  }

  a {
    @apply underline-offset-4 hover:underline;
  }

  h1 {
    @apply font-semibold tracking-tight text-4xl sm:text-5xl;
  }

  h2 {
    @apply font-semibold tracking-tight text-2xl mt-10 mb-4;
  }

  h1, h2, h3, h4 {
    line-height: 1.05;
    letter-spacing: -0.04em;
  }
}

@layer components {
  .card {
    @apply bg-background border border-border rounded-2xl shadow-sm p-8 sm:p-12;
  }

  .form-input {
    @apply bg-white px-4 py-3 border border-border rounded-lg outline-none transition-shadow;
    @apply focus:ring-2 focus:ring-ring focus:border-transparent;
  }

  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition border border-border hover:border-foreground/50 no-underline;
  }

  .btn-dark {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 hover:border-primary/90;
  }

  .btn-light {
    @apply bg-transparent text-foreground hover:border-foreground/50;
  }
}

@layer utilities {
  .font-logo {
    font-family: var(--font-logo);
  }
}
`;
}

export function getEmojiFaviconSvg(emoji: string): string {
	// URL-encode the SVG for use in data URL
	const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getFaviconExtension(filePath: string): string {
	const lastDotIndex = filePath.lastIndexOf('.');
	// No extension found - default to png
	if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
		return 'png';
	}
	const ext = filePath.slice(lastDotIndex + 1).toLowerCase();
	// Normalize common extensions
	if (ext === 'jpg') return 'jpeg';
	return ext;
}

export function getAppHtml(config: ProjectConfig): string {
	let faviconLink: string;

	if (config.logo.type === 'emoji') {
		// Use inline SVG data URL for emoji favicons
		faviconLink = `<link rel="icon" href="${getEmojiFaviconSvg(config.logo.value)}" />`;
	} else {
		// Reference the copied favicon file
		const ext = getFaviconExtension(config.logo.value);
		const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
		faviconLink = `<link rel="icon" type="${mimeType}" href="%sveltekit.assets%/favicon.${ext}" />`;
	}

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		${faviconLink}
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`;
}

export function getAppDts(): string {
	return `// See https://kit.svelte.dev/docs/types#app
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
`;
}

export function getLayoutTs(): string {
	return `// Prerender all pages at build time for static hosting
// Client-side navigation still works (SPA-like, no page reloads)
export const prerender = true;
`;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
