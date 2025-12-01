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
		const srcComponents = join(process.cwd(), 'src', 'lib', 'components');
		const destComponents = join(process.cwd(), 'dist', 'lib', 'components');

		// Clean and recreate destination
		await rm(destComponents, { recursive: true, force: true });
		await mkdir(destComponents, { recursive: true });

		// Copy blocks, ui, and forms directories
		await cp(join(srcComponents, 'blocks'), join(destComponents, 'blocks'), { recursive: true });
		await cp(join(srcComponents, 'ui'), join(destComponents, 'ui'), { recursive: true });
		await cp(join(srcComponents, 'forms'), join(destComponents, 'forms'), { recursive: true });

		console.log('✓ Component library copied to dist/lib/components');
	}
});
