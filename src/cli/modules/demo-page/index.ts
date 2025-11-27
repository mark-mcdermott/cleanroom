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
	getLayoutTs
} from '../base/files';
import { getSimpleHero } from '../base/components';

function getLayoutSvelte(): string {
	return `<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-dvh flex flex-col">
	<main class="flex-1">
		{@render children()}
	</main>
</div>
`;
}

function getPageSvelte(config: ProjectConfig): string {
	const hero = getSimpleHero(config);

	return `<svelte:head>
	<title>${config.projectName}</title>
	<meta name="description" content="${config.projectName}" />
</svelte:head>

${hero}
`;
}

export const demoPageModule: GeneratorModule = {
	name: 'demo-page',
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
		await writeFile(join(outputDir, 'src', 'routes', '+layout.svelte'), getLayoutSvelte());
		await writeFile(join(outputDir, 'src', 'routes', '+layout.ts'), getLayoutTs());
		await writeFile(join(outputDir, 'src', 'routes', '+page.svelte'), getPageSvelte(config));

		// Copy logo if it's a file
		if (config.logo.type === 'file') {
			try {
				await copyFile(config.logo.value, join(outputDir, 'static', 'logo.png'));
			} catch {
				// Logo file doesn't exist or can't be copied - that's okay
			}
		}
	}
};
