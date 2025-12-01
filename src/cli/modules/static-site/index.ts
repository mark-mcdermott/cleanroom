import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, GeneratorModule } from '../types';
import {
	getSvelteConfig,
	getViteConfig,
	getTsConfig,
	getGitignore,
	getAppCss,
	getAppHtml,
	getAppDts,
	getLayoutTs,
	getFaviconExtension
} from '../base/files';
import { copyComponentLibrary, slugify } from '../../helpers';

// Package.json with component library dependencies
function getPackageJson(config: ProjectConfig): string {
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
  "dependencies": {
    "bits-ui": "^2.14.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-svelte": "^0.555.0",
    "tailwind-merge": "^3.4.0"
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

function getLayoutSvelte(config: ProjectConfig): string {
	const displayName = config.prettyName || config.projectName;
	const logoExt = getFaviconExtension(config.logo.value);
	const logoValue =
		config.logo.type === 'emoji' ? `"${config.logo.value}"` : `"/logo.${logoExt}"`;

	return `<script lang="ts">
	import '../app.css';
	import { Nav, Footer } from '$lib/components/blocks';
	import type { NavLink } from '$lib/components/blocks';

	let { children } = $props();

	const navLinks: NavLink[] = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<div class="min-h-dvh flex flex-col">
	<Nav
		siteName="${displayName}"
		logo={${logoValue}}
		links={navLinks}
		maxWidth="max-w-6xl"
	/>

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer siteName="${displayName}" logo={${logoValue}} maxWidth="max-w-6xl" />
</div>
`;
}

function getHomePageSvelte(config: ProjectConfig): string {
	const logoExt = getFaviconExtension(config.logo.value);
	const displayName = config.prettyName || config.projectName;
	const logoDisplay =
		config.logo.type === 'emoji'
			? `<span class="text-5xl sm:text-6xl">${config.logo.value}</span>`
			: `<img src="/logo.${logoExt}" alt="${displayName}" class="h-12 sm:h-16 w-auto object-contain" />`;

	return `<svelte:head>
	<title>${displayName}</title>
	<meta name="description" content="${displayName} - Home" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16 text-center">
	<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
		${logoDisplay}
		Welcome to ${displayName}
	</h1>
</div>
`;
}

function getAboutPageSvelte(config: ProjectConfig): string {
	const displayName = config.prettyName || config.projectName;
	return `<svelte:head>
	<title>About - ${displayName}</title>
	<meta name="description" content="About ${displayName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">About</h1>
	<p class="text-muted-foreground text-lg mt-4">
		Tell your story here. What makes ${displayName} special?
	</p>
</div>
`;
}

function getContactPageSvelte(config: ProjectConfig): string {
	const displayName = config.prettyName || config.projectName;
	return `<svelte:head>
	<title>Contact - ${displayName}</title>
	<meta name="description" content="Contact ${displayName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">Contact</h1>
	<p class="text-muted-foreground text-lg mt-4">
		Get in touch with us.
	</p>

	<div class="mt-8 card max-w-md">
		<form class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-muted-foreground mb-1">Name</label>
				<input type="text" id="name" name="name" class="form-input w-full" placeholder="Your name" />
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-muted-foreground mb-1">Email</label>
				<input type="email" id="email" name="email" class="form-input w-full" placeholder="you@example.com" />
			</div>
			<div>
				<label for="message" class="block text-sm font-medium text-muted-foreground mb-1">Message</label>
				<textarea id="message" name="message" rows="4" class="form-input w-full" placeholder="Your message"></textarea>
			</div>
			<button type="submit" class="btn btn-dark w-full">Send Message</button>
		</form>
	</div>
</div>
`;
}

export const staticSiteModule: GeneratorModule = {
	name: 'static-site',
	async generate(config: ProjectConfig, outputDir: string) {
		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes', 'about'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'contact'), { recursive: true });
		await mkdir(join(outputDir, 'static'), { recursive: true });

		// Copy component library (Nav, Footer, and required UI components)
		await copyComponentLibrary(outputDir);

		// Write config files
		await writeFile(join(outputDir, 'package.json'), getPackageJson(config));
		await writeFile(join(outputDir, 'svelte.config.js'), getSvelteConfig());
		await writeFile(join(outputDir, 'vite.config.ts'), getViteConfig());
		await writeFile(join(outputDir, 'tsconfig.json'), getTsConfig());
		await writeFile(join(outputDir, '.gitignore'), getGitignore());

		// Write app files
		await writeFile(join(outputDir, 'src', 'app.css'), getAppCss());
		await writeFile(join(outputDir, 'src', 'app.html'), getAppHtml(config));
		await writeFile(join(outputDir, 'src', 'app.d.ts'), getAppDts());

		// Write route files
		await writeFile(join(outputDir, 'src', 'routes', '+layout.svelte'), getLayoutSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', '+layout.ts'), getLayoutTs());
		await writeFile(join(outputDir, 'src', 'routes', '+page.svelte'), getHomePageSvelte(config));
		await writeFile(
			join(outputDir, 'src', 'routes', 'about', '+page.svelte'),
			getAboutPageSvelte(config)
		);
		await writeFile(
			join(outputDir, 'src', 'routes', 'contact', '+page.svelte'),
			getContactPageSvelte(config)
		);

		// Copy logo file to static folder (as both favicon and logo)
		if (config.logo.type === 'file') {
			try {
				const ext = getFaviconExtension(config.logo.value);
				await copyFile(config.logo.value, join(outputDir, 'static', `favicon.${ext}`));
				await copyFile(config.logo.value, join(outputDir, 'static', `logo.${ext}`));
			} catch {
				// Logo file doesn't exist or can't be copied
			}
		}
	}
};
