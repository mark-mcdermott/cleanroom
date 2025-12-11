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
import { copyComponentLibrary, slugify } from '../../helpers';

// Package.json with component library dependencies
function getPackageJsonWithComponents(config: ProjectConfig): string {
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
    "svelte-sonner": "^0.3.28",
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

const defaultLinks = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/services', label: 'Services' },
	{ href: '/contact', label: 'Contact' }
];

function getLayoutSvelte(config: ProjectConfig): string {
	const hasAuth = config.modules.includes('auth');
	const displayName = config.prettyName || config.projectName;
	const logoExt = getFaviconExtension(config.logo.value);
	const logoValue = config.logo.type === 'emoji'
		? `"${config.logo.value}"`
		: `"/logo.${logoExt}"`;

	// Build nav links array as code
	const navLinksCode = hasAuth
		? `[
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/services', label: 'Services' },
		{ href: '/contact', label: 'Contact' },
		{ href: '/login', label: 'Log In', hideWhenAuth: true, testId: 'nav-login' },
		{ href: '/signup', label: 'Sign Up', hideWhenAuth: true, testId: 'nav-signup' }
	]`
		: `[
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/services', label: 'Services' },
		{ href: '/contact', label: 'Contact' }
	]`;

	// Avatar config for auth sites
	const avatarConfigCode = hasAuth
		? `
	const profileUrl = $derived(data.user?.id ? \`/u/\${data.user.id}\` : '#');

	const avatarConfig = $derived<AvatarConfig>({
		show: true,
		links: [
			{
				label: 'Profile',
				href: profileUrl,
				icon: User,
				testId: 'menu-profile'
			},
			{
				label: 'Settings',
				href: '/account',
				icon: Settings,
				testId: 'menu-settings'
			},
			{
				label: 'Sign Out',
				icon: LogOut,
				action: '/logout',
				testId: 'menu-signout',
				separator: true
			}
		]
	});`
		: '';

	// Imports for auth
	const authImports = hasAuth
		? `\n\timport { User, Settings, LogOut } from 'lucide-svelte';`
		: '';

	const typeImports = hasAuth
		? 'import type { NavLink, AvatarConfig } from \'$lib/components/blocks\';'
		: 'import type { NavLink } from \'$lib/components/blocks\';';

	// Props declaration
	const propsDeclaration = hasAuth
		? 'let { children, data } = $props();'
		: 'let { children } = $props();';

	// Nav component props
	const navProps = hasAuth
		? `siteName="${displayName}"
		logo={${logoValue}}
		links={navLinks}
		maxWidth="max-w-6xl"
		user={data.user}
		avatar={avatarConfig}`
		: `siteName="${displayName}"
		logo={${logoValue}}
		links={navLinks}
		maxWidth="max-w-6xl"`;

	return `<script lang="ts">
	import '../app.css';
	import { Nav, Footer } from '$lib/components/blocks';
	import { onNavigate } from '$app/navigation';
	${typeImports}${authImports}

	${propsDeclaration}

	const navLinks: NavLink[] = ${navLinksCode};
${avatarConfigCode}

	// Enable View Transitions API for smooth page transitions
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="min-h-dvh flex flex-col">
	<Nav
		${navProps}
	/>

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer siteName="${displayName}" logo={${logoValue}} maxWidth="max-w-6xl" />
</div>
`;
}

// Module info with descriptions
const moduleInfo: Record<string, { emoji: string; label: string; description: string }> = {
	// Main modules
	blog: { emoji: '📝', label: 'Blog', description: 'Markdown-powered blog with posts, tags, and RSS feed' },
	leaderboard: { emoji: '🏆', label: 'Leaderboard', description: 'Click game with high score tracking and rankings' },
	lobby: { emoji: '🎥', label: 'Lobby', description: 'Video room powered by Daily.co for meditation or hangouts' },
	resume: { emoji: '📄', label: 'Resume', description: 'Interactive resume builder with PDF export' },
	store: { emoji: '🛒', label: 'Store', description: 'E-commerce store with Stripe payments and Printful fulfillment' },
	tracker: { emoji: '📊', label: 'Tracker', description: 'Activity and habit tracking dashboard with progress visualization' },
	videos: { emoji: '🌍', label: 'Videos', description: 'Travel videos with interactive globe explorer' },
	widgets: { emoji: '🧩', label: 'Widgets', description: 'Dashboard widgets for data visualization and productivity' }
};

// Add-on info - label can be dynamic based on config
const addonInfo: Record<string, { emoji: string; label: string }> = {
	auth: { emoji: '🔐', label: 'User Authentication' },
	'dark-toggle': { emoji: '🌓', label: 'Light/Dark Theme Toggle' }, // Will be overridden if system mode
	'office-users': { emoji: '💼', label: 'Users from The Office' },
	'theme-preview': { emoji: '🎨', label: 'ThemeForseen live color & font preview' },
	merch: { emoji: '👕', label: 'Merchandise Store' }
};

// Main modules (not add-ons)
const MAIN_MODULES = ['blog', 'leaderboard', 'lobby', 'resume', 'store', 'tracker', 'videos', 'widgets'];

// Module-specific homepage content
interface ModuleHomepageContent {
	moduleDescription: string; // e.g., "a Markdown-powered blog with tags and RSS"
	siteDescription: string; // e.g., "a server-side rendered SvelteKit app"
	featuresTitle: string;
	features: Array<{ emoji: string; title: string; description: string }>;
	ctaTitle: string;
	ctaDescription: string;
	ctaButtonText: string;
	ctaButtonHref: string;
}

const moduleHomepageContent: Record<string, ModuleHomepageContent> = {
	blog: {
		moduleDescription: 'a Markdown-powered blog with tags, categories, and RSS feeds',
		siteDescription: 'a server-side rendered SvelteKit app with smooth page transitions',
		featuresTitle: 'Built for Writers',
		features: [
			{ emoji: '✍️', title: 'Markdown First', description: 'Write in Markdown with syntax highlighting, images, and rich formatting. No database required.' },
			{ emoji: '🏷️', title: 'Tags & Categories', description: 'Organize posts with tags for easy discovery. Filter and browse by topic.' },
			{ emoji: '📡', title: 'RSS Feed', description: 'Automatic RSS feed generation so readers can subscribe and never miss a post.' }
		],
		ctaTitle: 'Start Writing',
		ctaDescription: 'Your thoughts deserve a beautiful home. Start sharing your ideas with the world today.',
		ctaButtonText: 'Read the Blog',
		ctaButtonHref: '/blog'
	},
	leaderboard: {
		moduleDescription: 'a fast-paced clicking game with real-time leaderboards and high score tracking',
		siteDescription: 'a server-side rendered SvelteKit app with live data updates',
		featuresTitle: 'Game On',
		features: [
			{ emoji: '🎯', title: 'Click Challenge', description: 'Test your speed with an addictive clicking game. How fast can you go?' },
			{ emoji: '📊', title: 'Live Rankings', description: 'Real-time leaderboard tracks top players. See where you stand against the competition.' },
			{ emoji: '🏅', title: 'Personal Bests', description: 'Track your own progress over time. Beat your personal records and climb the ranks.' }
		],
		ctaTitle: 'Ready to Play?',
		ctaDescription: 'Challenge yourself and see how you stack up against other players.',
		ctaButtonText: 'Start Playing',
		ctaButtonHref: '/leaderboard'
	},
	lobby: {
		moduleDescription: 'a video room for meditation sessions, virtual hangouts, or team meetings',
		siteDescription: 'a server-side rendered SvelteKit app powered by Daily.co',
		featuresTitle: 'Seamless Video',
		features: [
			{ emoji: '🎥', title: 'HD Video Calls', description: 'High-quality video and audio powered by Daily.co. No plugins or downloads required.' },
			{ emoji: '🧘', title: 'Meditation Ready', description: 'Perfect for guided meditation sessions, wellness groups, or mindful gatherings.' },
			{ emoji: '👥', title: 'Group Friendly', description: 'Invite friends, colleagues, or community members. Easy sharing and joining.' }
		],
		ctaTitle: 'Join a Room',
		ctaDescription: 'Start or join a video session in seconds. No account required for guests.',
		ctaButtonText: 'Enter the Lobby',
		ctaButtonHref: '/lobby'
	},
	resume: {
		moduleDescription: 'an interactive online resume with PDF export',
		siteDescription: 'a server-side rendered SvelteKit app with a shareable link',
		featuresTitle: 'Your Career, Showcased',
		features: [
			{ emoji: '🎨', title: 'Beautiful Design', description: 'Modern, clean layout that makes your experience shine. Fully responsive on any device.' },
			{ emoji: '📄', title: 'PDF Export', description: 'Generate a professional PDF version with one click. Perfect for job applications.' },
			{ emoji: '🔗', title: 'Shareable Link', description: 'Share your resume with a simple link. Always up-to-date, no attachments needed.' }
		],
		ctaTitle: 'Build Your Resume',
		ctaDescription: 'Create a professional online presence that gets you noticed.',
		ctaButtonText: 'View Resume',
		ctaButtonHref: '/resume'
	},
	store: {
		moduleDescription: 'an e-commerce store with Stripe payments and Printful print-on-demand fulfillment',
		siteDescription: 'a server-side rendered SvelteKit app with secure checkout',
		featuresTitle: 'Everything You Need',
		features: [
			{ emoji: '💳', title: 'Stripe Payments', description: 'Secure payment processing with Stripe. Accept cards, Apple Pay, and more.' },
			{ emoji: '📦', title: 'Print-on-Demand', description: 'Printful handles printing and shipping. No inventory, no hassle.' },
			{ emoji: '🛒', title: 'Full Cart', description: 'Shopping cart, checkout flow, and order management built right in.' }
		],
		ctaTitle: 'Start Selling',
		ctaDescription: 'Launch your online store and reach customers worldwide.',
		ctaButtonText: 'Browse Products',
		ctaButtonHref: '/store'
	},
	tracker: {
		moduleDescription: 'an activity and habit tracking dashboard with progress visualization',
		siteDescription: 'a server-side rendered SvelteKit app with real-time data',
		featuresTitle: 'Stay on Track',
		features: [
			{ emoji: '✅', title: 'Habit Tracking', description: 'Build better habits with daily check-ins and streak tracking.' },
			{ emoji: '📈', title: 'Progress Charts', description: 'Beautiful visualizations show your progress over time. See how far you\'ve come.' },
			{ emoji: '🎯', title: 'Goal Setting', description: 'Set targets and track your journey toward achieving them.' }
		],
		ctaTitle: 'Start Tracking',
		ctaDescription: 'Build better habits and achieve your goals with data-driven insights.',
		ctaButtonText: 'View Dashboard',
		ctaButtonHref: '/tracker'
	},
	videos: {
		moduleDescription: 'a travel video platform with an interactive globe explorer',
		siteDescription: 'a server-side rendered SvelteKit app with immersive content',
		featuresTitle: 'Discover Places',
		features: [
			{ emoji: '🌍', title: 'Interactive Globe', description: 'Explore destinations on a 3D globe. Click anywhere to discover videos from that location.' },
			{ emoji: '🎬', title: 'Curated Content', description: 'High-quality travel videos organized by destination, theme, and duration.' },
			{ emoji: '📍', title: 'Location Tags', description: 'Every video is geotagged. Build your travel wishlist as you explore.' }
		],
		ctaTitle: 'Start Exploring',
		ctaDescription: 'Let the videos take you places. Discover your next adventure.',
		ctaButtonText: 'Browse Videos',
		ctaButtonHref: '/videos'
	},
	widgets: {
		moduleDescription: 'a customizable dashboard with widgets for data visualization and productivity',
		siteDescription: 'a server-side rendered SvelteKit app with live updates',
		featuresTitle: 'Powerful Widgets',
		features: [
			{ emoji: '📊', title: 'Data Visualization', description: 'Charts, graphs, and metrics at a glance. See the numbers that matter.' },
			{ emoji: '⚡', title: 'Real-time Updates', description: 'Live data that refreshes automatically. Always current, never stale.' },
			{ emoji: '🧩', title: 'Customizable', description: 'Arrange and configure widgets to match your workflow.' }
		],
		ctaTitle: 'Get Started',
		ctaDescription: 'Build the perfect dashboard for your needs.',
		ctaButtonText: 'View Widgets',
		ctaButtonHref: '/widgets'
	}
};

// Default content when no module is selected
const defaultHomepageContent: ModuleHomepageContent = {
	moduleDescription: 'your new web application',
	siteDescription: 'a server-side rendered SvelteKit app with responsive navigation and smooth page transitions',
	featuresTitle: 'Why SSR?',
	features: [
		{ emoji: '🔐', title: 'Auth Ready', description: 'Server-side rendering enables secure session handling, making it the perfect base for authentication.' },
		{ emoji: '⚡', title: 'Dynamic Content', description: 'Fetch fresh data on every request. Perfect for dashboards, user profiles, and real-time content.' },
		{ emoji: '🛡️', title: 'Secure by Default', description: 'Server-side code stays on the server. API keys and sensitive logic never reach the client.' }
	],
	ctaTitle: 'Ready to Build?',
	ctaDescription: 'This template is designed to be extended with authentication, database connections, and protected routes.',
	ctaButtonText: 'View Our Services',
	ctaButtonHref: '/services'
};

function getModulesListHtml(config: ProjectConfig): string {
	const modules = config.modules;
	if (modules.length === 0) return '';

	// Separate main module from add-ons
	const mainModule = modules.find((mod) => MAIN_MODULES.includes(mod));
	const addons = modules.filter((mod) => !MAIN_MODULES.includes(mod));

	// Get addon display info, with dynamic dark-toggle label
	const getAddonDisplay = (mod: string) => {
		if (mod === 'dark-toggle') {
			const mode = config.darkToggle?.mode || 'light-dark';
			const label = mode === 'light-dark-system'
				? 'Light/Dark/System Theme Toggle'
				: 'Light/Dark Theme Toggle';
			return { emoji: '🌓', label };
		}
		return addonInfo[mod] || { emoji: '📦', label: mod };
	};

	// Case 1: Only module selected, no add-ons - single centered column
	if (mainModule && addons.length === 0) {
		const info = moduleInfo[mainModule] || { emoji: '📦', label: mainModule, description: '' };
		return `
	<!-- Module -->
	<div class="py-8 flex justify-center">
		<div class="text-left">
			<p class="text-lg"><span class="font-semibold">Module:</span> ${info.emoji} ${info.label}</p>
			<p class="text-sm text-muted-foreground mt-1">${info.description}</p>
		</div>
	</div>
`;
	}

	// Case 2: Module with 1-2 add-ons - two columns
	if (mainModule && addons.length > 0 && addons.length <= 2) {
		const info = moduleInfo[mainModule] || { emoji: '📦', label: mainModule, description: '' };
		const addonItems = addons
			.map((mod) => {
				const { emoji, label } = getAddonDisplay(mod);
				return `					<div class="flex gap-3 items-center">
						<div class="text-xl">${emoji}</div>
						<span class="font-medium">${label}</span>
					</div>`;
			})
			.join('\n');

		return `
	<!-- Module & Add-ons (2 columns) -->
	<div class="py-8">
		<div class="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto px-4">
			<div class="text-left">
				<p class="text-lg"><span class="font-semibold">Module:</span> ${info.emoji} ${info.label}</p>
				<p class="text-sm text-muted-foreground mt-1">${info.description}</p>
			</div>
			<div class="text-left">
				<h3 class="text-lg font-semibold mb-3">Add-ons</h3>
				<div class="space-y-2">
${addonItems}
				</div>
			</div>
		</div>
	</div>
`;
	}

	// Case 3: Module with 3+ add-ons - three columns (module 1 col, add-ons 2 cols)
	if (mainModule && addons.length > 2) {
		const info = moduleInfo[mainModule] || { emoji: '📦', label: mainModule, description: '' };
		const addonItems = addons
			.map((mod) => {
				const { emoji, label } = getAddonDisplay(mod);
				return `					<div class="flex gap-3 items-center">
						<div class="text-xl">${emoji}</div>
						<span class="font-medium">${label}</span>
					</div>`;
			})
			.join('\n');

		return `
	<!-- Module & Add-ons (3 columns) -->
	<div class="py-8">
		<div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
			<div class="text-left">
				<p class="text-lg"><span class="font-semibold">Module:</span> ${info.emoji} ${info.label}</p>
				<p class="text-sm text-muted-foreground mt-1">${info.description}</p>
			</div>
			<div class="text-left md:col-span-2">
				<h3 class="text-lg font-semibold mb-3">Add-ons</h3>
				<div class="grid sm:grid-cols-2 gap-2">
${addonItems}
				</div>
			</div>
		</div>
	</div>
`;
	}

	// Case 4: Only add-ons, no module - centered list
	if (!mainModule && addons.length > 0) {
		const addonItems = addons
			.map((mod) => {
				const { emoji, label } = getAddonDisplay(mod);
				return `				<div class="flex gap-3 items-center">
					<div class="text-xl">${emoji}</div>
					<span class="font-medium">${label}</span>
				</div>`;
			})
			.join('\n');

		return `
	<!-- Add-ons -->
	<div class="py-8 flex justify-center">
		<div class="text-left">
			<h3 class="text-lg font-semibold mb-3">Add-ons</h3>
			<div class="space-y-2">
${addonItems}
			</div>
		</div>
	</div>
`;
	}

	return '';
}

function getHomePageSvelte(config: ProjectConfig): string {
	const displayName = config.prettyName || config.projectName;

	// Find the main module (if any) to get module-specific content
	const mainModule = config.modules.find((mod) => MAIN_MODULES.includes(mod));
	const content = mainModule ? moduleHomepageContent[mainModule] : defaultHomepageContent;

	const hasModules = config.modules.length > 0;

	// Only show hero buttons if no modules are selected
	const heroButtons = hasModules
		? ''
		: `
		<div class="flex flex-wrap justify-center gap-3 mt-6">
			<a href="/about" class="btn btn-dark">Learn More</a>
			<a href="/contact" class="btn btn-light">Get in Touch</a>
		</div>`;

	const modulesSection = getModulesListHtml(config);

	// Generate features HTML from the content
	const featuresHtml = content.features
		.map(
			(f) => `			<div class="text-center">
				<div class="text-3xl mb-3">${f.emoji}</div>
				<h3 class="font-medium mb-1">${f.title}</h3>
				<p class="text-sm text-muted-foreground">${f.description}</p>
			</div>`
		)
		.join('\n');

	// Build the hero sentence: "[Site Name] is [module description] running on [site description]."
	const heroSentence = `<span class="font-semibold">${displayName}</span> is ${content.moduleDescription}, running on ${content.siteDescription}.`;

	return `<svelte:head>
	<title>${displayName}</title>
	<meta name="description" content="${displayName} - ${content.moduleDescription}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-16">
	<!-- Hero Section -->
	<div class="py-12 sm:py-16 text-center">
		<p class="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
			${heroSentence}
		</p>${heroButtons}
	</div>
${modulesSection}
	<!-- Features Section -->
	<div class="py-8">
		<h2 class="text-2xl font-semibold tracking-tight text-center mb-8">${content.featuresTitle}</h2>
		<div class="grid sm:grid-cols-3 gap-6">
${featuresHtml}
		</div>
	</div>

	<!-- CTA Section -->
	<div class="py-8 mt-4">
		<div class="card text-center py-8">
			<h2 class="text-2xl font-semibold tracking-tight mb-2 mt-0">${content.ctaTitle}</h2>
			<p class="text-muted-foreground mb-6">${content.ctaDescription}</p>
			<a href="${content.ctaButtonHref}" class="btn btn-dark">${content.ctaButtonText}</a>
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

		// Copy component library (Nav, Footer, and required UI components)
		await copyComponentLibrary(outputDir);

		// Write config files (with lucide-svelte dependency)
		await writeFile(join(outputDir, 'package.json'), getPackageJsonWithComponents(config));
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
