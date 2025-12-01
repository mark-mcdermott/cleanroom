import { defineConfig } from 'tsup';
import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

export default defineConfig({
	entry: ['src/cli/index.ts'],
	format: ['esm'],
	outDir: 'dist/cli',
	clean: true,
	shims: true,
	banner: {
		js: '#!/usr/bin/env node'
	},
	async onSuccess() {
		// Copy component library to dist/lib/components for the CLI to use
		const srcLib = join(process.cwd(), 'src', 'lib');
		const destLib = join(process.cwd(), 'dist', 'lib');
		const srcComponents = join(srcLib, 'components');
		const destComponents = join(destLib, 'components');

		// Clean and recreate destination
		await rm(destComponents, { recursive: true, force: true });
		await mkdir(destComponents, { recursive: true });

		// Copy blocks, ui, and forms directories
		await cp(join(srcComponents, 'blocks'), join(destComponents, 'blocks'), { recursive: true });
		await cp(join(srcComponents, 'ui'), join(destComponents, 'ui'), { recursive: true });
		await cp(join(srcComponents, 'forms'), join(destComponents, 'forms'), { recursive: true });

		// Copy utils.ts (needed by components for cn() function)
		await cp(join(srcLib, 'utils.ts'), join(destLib, 'utils.ts'));

		console.log('✓ Component library copied to dist/lib/components');
	}
});
