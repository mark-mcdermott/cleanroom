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
	getAppDts
} from '../base/files';
import { getNav, getSectionHero, getSection, getFooter } from '../base/components';

const defaultSections = [
	{ id: 'features', title: 'Features', content: 'Describe your key features here.' },
	{ id: 'about', title: 'About', content: 'Tell your story and what makes you unique.' },
	{ id: 'contact', title: 'Contact', content: 'Get in touch with us.' }
];

function getLayoutSvelte(config: ProjectConfig): string {
	const nav = getNav(
		config,
		defaultSections.map((s) => ({ href: `#${s.id}`, label: s.title }))
	);
	const footer = getFooter(config);

	return `<script lang="ts">
	import '../app.css';

	let { children } = $props();
	let mobileMenuOpen = $state(false);
</script>

<div class="min-h-dvh flex flex-col">
	${nav}

	<main class="flex-1">
		{@render children()}
	</main>

	${footer}
</div>
`;
}

function getPageSvelte(config: ProjectConfig): string {
	const hero = getSectionHero(
		config,
		defaultSections.map((s) => s.title)
	);
	const sections = defaultSections.map((s) => getSection(s.id, s.title, s.content)).join('\n\n');

	return `<svelte:head>
	<title>${config.projectName}</title>
	<meta name="description" content="${config.projectName}" />
</svelte:head>

${hero}

${sections}
`;
}

export const landingSectionsModule: GeneratorModule = {
	name: 'landing-sections',
	async generate(config: ProjectConfig, outputDir: string) {
		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes'), { recursive: true });
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
		await writeFile(join(outputDir, 'src', 'routes', '+page.svelte'), getPageSvelte(config));

		// Copy logo if it's a file
		if (config.logo.type === 'file') {
			try {
				await copyFile(config.logo.value, join(outputDir, 'static', 'logo.png'));
			} catch {
				// Logo file doesn't exist or can't be copied
			}
		}
	}
};
