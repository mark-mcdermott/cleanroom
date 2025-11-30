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
	getFaviconExtension
} from '../base/files';
import { getHeader, getFooter } from '../base/components';

const defaultPages = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/services', label: 'Services' },
	{ href: '/contact', label: 'Contact' }
];

const authPages = [
	{ href: '/login', label: 'Log In' },
	{ href: '/signup', label: 'Sign Up' }
];

function getLayoutSvelte(config: ProjectConfig): string {
	const hasAuth = config.modules.includes('auth');
	const pages = hasAuth ? [...defaultPages, ...authPages] : defaultPages;
	const header = getHeader(config, pages);
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

const moduleEmojis: Record<string, { emoji: string; label: string }> = {
	auth: { emoji: '🔐', label: 'Authentication' },
	blog: { emoji: '📝', label: 'Blog' },
	'office-users': { emoji: '👥', label: 'The Office Users' }
};

function getModulesListHtml(modules: string[]): string {
	if (modules.length === 0) return '';

	const items = modules
		.map((mod) => {
			const { emoji, label } = moduleEmojis[mod] || { emoji: '📦', label: mod };
			return `			<div class="flex gap-4 items-center justify-center">
				<div class="text-2xl">${emoji}</div>
				<h3 class="font-medium">${label}</h3>
			</div>`;
		})
		.join('\n');

	return `
	<!-- Modules Added -->
	<div class="py-8 text-center">
		<h2 class="text-xl font-semibold mb-6">Modules Added</h2>
		<div class="space-y-4">
${items}
		</div>
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

	const hasModules = config.modules.length > 0;

	// Only show hero buttons if no modules are selected
	const heroButtons = hasModules
		? ''
		: `
		<div class="flex flex-wrap justify-center gap-3 mt-6">
			<a href="/about" class="btn btn-dark">Learn More</a>
			<a href="/contact" class="btn btn-light">Get in Touch</a>
		</div>`;

	const modulesSection = getModulesListHtml(config.modules);

	return `<svelte:head>
	<title>${displayName}</title>
	<meta name="description" content="${displayName} - Home" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-16">
	<!-- Hero Section -->
	<div class="py-12 sm:py-16 text-center">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			${logoDisplay}
			${displayName}
		</h1>
		<p class="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
			A multi-page server-side rendered site with responsive navigation and smooth page transitions. Unlike static sites, pages are rendered on each request—ideal for authenticated content, user dashboards, or dynamic data.
		</p>${heroButtons}
	</div>
${modulesSection}
	<!-- Features Section -->
	<div class="py-8">
		<h2 class="text-2xl font-semibold tracking-tight text-center mb-8">Why SSR?</h2>
		<div class="grid sm:grid-cols-3 gap-6">
			<div class="text-center">
				<div class="text-3xl mb-3">🔐</div>
				<h3 class="font-medium mb-1">Auth Ready</h3>
				<p class="text-sm text-muted-foreground">Server-side rendering enables secure session handling, making it the perfect base for authentication.</p>
			</div>
			<div class="text-center">
				<div class="text-3xl mb-3">⚡</div>
				<h3 class="font-medium mb-1">Dynamic Content</h3>
				<p class="text-sm text-muted-foreground">Fetch fresh data on every request. Perfect for dashboards, user profiles, and real-time content.</p>
			</div>
			<div class="text-center">
				<div class="text-3xl mb-3">🛡️</div>
				<h3 class="font-medium mb-1">Secure by Default</h3>
				<p class="text-sm text-muted-foreground">Server-side code stays on the server. API keys and sensitive logic never reach the client.</p>
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="py-8 mt-4">
		<div class="card text-center py-8">
			<h2 class="text-2xl font-semibold tracking-tight mb-2 mt-0">Ready to Build?</h2>
			<p class="text-muted-foreground mb-6">This template is designed to be extended with authentication, database connections, and protected routes.</p>
			<a href="/services" class="btn btn-dark">View Our Services</a>
		</div>
	</div>
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

function getServicesPageSvelte(config: ProjectConfig): string {
	const displayName = config.prettyName || config.projectName;
	return `<svelte:head>
	<title>Services - ${displayName}</title>
	<meta name="description" content="Services offered by ${displayName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">Services</h1>
	<p class="text-muted-foreground text-lg mt-4">
		What we offer to help you succeed.
	</p>

	<div class="grid sm:grid-cols-2 gap-6 mt-8">
		<div class="card">
			<div class="text-2xl mb-2">🚀</div>
			<h3 class="font-semibold mb-2">Web Development</h3>
			<p class="text-sm text-muted-foreground">Custom web applications built with modern technologies and best practices.</p>
		</div>
		<div class="card">
			<div class="text-2xl mb-2">📱</div>
			<h3 class="font-semibold mb-2">Mobile Apps</h3>
			<p class="text-sm text-muted-foreground">Native and cross-platform mobile applications for iOS and Android.</p>
		</div>
		<div class="card">
			<div class="text-2xl mb-2">☁️</div>
			<h3 class="font-semibold mb-2">Cloud Solutions</h3>
			<p class="text-sm text-muted-foreground">Scalable cloud infrastructure and deployment strategies.</p>
		</div>
		<div class="card">
			<div class="text-2xl mb-2">🔧</div>
			<h3 class="font-semibold mb-2">Consulting</h3>
			<p class="text-sm text-muted-foreground">Expert guidance on architecture, technology choices, and best practices.</p>
		</div>
	</div>
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

export const ssrSiteModule: GeneratorModule = {
	name: 'ssr-site',
	async generate(config: ProjectConfig, outputDir: string) {
		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes', 'about'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'services'), { recursive: true });
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

		// Write route files (NO +layout.ts with prerender - that's the key difference for SSR)
		await writeFile(join(outputDir, 'src', 'routes', '+layout.svelte'), getLayoutSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', '+page.svelte'), getHomePageSvelte(config));
		await writeFile(
			join(outputDir, 'src', 'routes', 'about', '+page.svelte'),
			getAboutPageSvelte(config)
		);
		await writeFile(
			join(outputDir, 'src', 'routes', 'services', '+page.svelte'),
			getServicesPageSvelte(config)
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
