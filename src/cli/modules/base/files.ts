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
}

@layer base {
  html {
    font-family: "Inter", system-ui, sans-serif;
    @apply antialiased bg-white text-zinc-900;
  }

  body {
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      #ffffff;
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
    @apply bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 sm:p-12;
  }

  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition border border-zinc-300 hover:border-zinc-500 no-underline;
  }

  .btn-dark {
    @apply bg-zinc-900 text-white hover:bg-zinc-700 hover:border-zinc-700;
  }

  .btn-light {
    @apply bg-transparent text-zinc-800 hover:border-zinc-600 hover:text-zinc-900;
  }
}

@layer utilities {
  .font-logo {
    font-family: var(--font-logo);
  }
}
`;
}

export function getAppHtml(config: ProjectConfig): string {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
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

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
