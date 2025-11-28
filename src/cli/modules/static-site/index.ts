import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, GeneratorModule } from '../types';
import {
	getPackageJson,
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
import { getHeader, getFooter } from '../base/components';

const defaultPages = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' }
];

function getLayoutSvelte(config: ProjectConfig): string {
	const header = getHeader(config, defaultPages);
	const footer = getFooter(config);

	return `<script lang="ts">
	import '../app.css';

	let { children } = $props();
	let mobileMenuOpen = $state(false);
</script>

<div class="min-h-dvh flex flex-col">
	${header}

	<main class="flex-1">
		{@render children()}
	</main>

	${footer}
</div>
`;
}

function getHomePageSvelte(config: ProjectConfig): string {
	const logoDisplay =
		config.logo.type === 'emoji'
			? `<span class="text-5xl sm:text-6xl">${config.logo.value}</span>`
			: `<img src="/logo.png" alt="${config.projectName}" class="w-12 h-12 sm:w-16 sm:h-16" />`;

	return `<svelte:head>
	<title>${config.projectName}</title>
	<meta name="description" content="${config.projectName} - Home" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16 text-center">
	<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
		${logoDisplay}
		Welcome to ${config.projectName}
	</h1>
</div>
`;
}

function getAboutPageSvelte(config: ProjectConfig): string {
	return `<svelte:head>
	<title>About - ${config.projectName}</title>
	<meta name="description" content="About ${config.projectName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">About</h1>
	<p class="text-zinc-600 text-lg mt-4">
		Tell your story here. What makes ${config.projectName} special?
	</p>
</div>
`;
}

function getContactPageSvelte(config: ProjectConfig): string {
	return `<svelte:head>
	<title>Contact - ${config.projectName}</title>
	<meta name="description" content="Contact ${config.projectName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">Contact</h1>
	<p class="text-zinc-600 text-lg mt-4">
		Get in touch with us.
	</p>

	<div class="mt-8 card max-w-md">
		<form class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-zinc-700 mb-1">Name</label>
				<input type="text" id="name" name="name" class="form-input w-full" placeholder="Your name" />
			</div>
			<div>
				<label for="email" class="block text-sm font-medium text-zinc-700 mb-1">Email</label>
				<input type="email" id="email" name="email" class="form-input w-full" placeholder="you@example.com" />
			</div>
			<div>
				<label for="message" class="block text-sm font-medium text-zinc-700 mb-1">Message</label>
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

		// Copy favicon if logo is a file
		if (config.logo.type === 'file') {
			try {
				const ext = getFaviconExtension(config.logo.value);
				await copyFile(config.logo.value, join(outputDir, 'static', `favicon.${ext}`));
			} catch {
				// Logo file doesn't exist or can't be copied
			}
		}
	}
};
