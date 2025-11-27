import { describe, it, expect } from 'vitest';
import {
	getPackageJson,
	getSvelteConfig,
	getViteConfig,
	getTsConfig,
	getGitignore,
	getAppCss,
	getAppHtml,
	getAppDts
} from '../../../src/cli/modules/base/files';
import type { ProjectConfig } from '../../../src/cli/modules/types';

describe('File Templates', () => {
	const baseConfig: ProjectConfig = {
		projectName: 'Test App',
		logo: { type: 'emoji', value: '🚀' },
		siteType: 'demo-page',
		github: { repoUrl: 'https://github.com/test/test-app' },
		cloudflare: { configured: false },
		domain: { hasDomain: false, configured: false }
	};

	describe('getPackageJson', () => {
		it('creates valid JSON', () => {
			const json = getPackageJson(baseConfig);
			expect(() => JSON.parse(json)).not.toThrow();
		});

		it('slugifies project name', () => {
			const json = getPackageJson(baseConfig);
			const pkg = JSON.parse(json);
			expect(pkg.name).toBe('test-app');
		});

		it('includes required scripts', () => {
			const json = getPackageJson(baseConfig);
			const pkg = JSON.parse(json);
			expect(pkg.scripts.dev).toBe('vite dev');
			expect(pkg.scripts.build).toBe('vite build');
			expect(pkg.scripts.preview).toBe('vite preview');
			expect(pkg.scripts.check).toContain('svelte-check');
		});

		it('includes Cloudflare adapter', () => {
			const json = getPackageJson(baseConfig);
			const pkg = JSON.parse(json);
			expect(pkg.devDependencies['@sveltejs/adapter-cloudflare']).toBeDefined();
		});

		it('includes Tailwind CSS v4', () => {
			const json = getPackageJson(baseConfig);
			const pkg = JSON.parse(json);
			expect(pkg.devDependencies['tailwindcss']).toContain('^4');
			expect(pkg.devDependencies['@tailwindcss/vite']).toContain('^4');
		});

		it('requires Node 22+', () => {
			const json = getPackageJson(baseConfig);
			const pkg = JSON.parse(json);
			expect(pkg.engines.node).toBe('>=22');
		});

		it('is ES module', () => {
			const json = getPackageJson(baseConfig);
			const pkg = JSON.parse(json);
			expect(pkg.type).toBe('module');
		});
	});

	describe('getSvelteConfig', () => {
		it('imports Cloudflare adapter', () => {
			const config = getSvelteConfig();
			expect(config).toContain("import adapter from '@sveltejs/adapter-cloudflare'");
		});

		it('uses vitePreprocess', () => {
			const config = getSvelteConfig();
			expect(config).toContain('vitePreprocess');
		});

		it('exports config object', () => {
			const config = getSvelteConfig();
			expect(config).toContain('export default config');
		});
	});

	describe('getViteConfig', () => {
		it('includes SvelteKit plugin', () => {
			const config = getViteConfig();
			expect(config).toContain('sveltekit');
		});

		it('includes Tailwind CSS plugin', () => {
			const config = getViteConfig();
			expect(config).toContain('tailwindcss');
			expect(config).toContain("@tailwindcss/vite");
		});

		it('uses defineConfig', () => {
			const config = getViteConfig();
			expect(config).toContain('defineConfig');
		});
	});

	describe('getTsConfig', () => {
		it('creates valid JSON', () => {
			const config = getTsConfig();
			expect(() => JSON.parse(config)).not.toThrow();
		});

		it('extends SvelteKit tsconfig', () => {
			const config = getTsConfig();
			const parsed = JSON.parse(config);
			expect(parsed.extends).toBe('./.svelte-kit/tsconfig.json');
		});

		it('enables strict mode', () => {
			const config = getTsConfig();
			const parsed = JSON.parse(config);
			expect(parsed.compilerOptions.strict).toBe(true);
		});
	});

	describe('getGitignore', () => {
		it('ignores node_modules', () => {
			const gitignore = getGitignore();
			expect(gitignore).toContain('node_modules');
		});

		it('ignores .svelte-kit', () => {
			const gitignore = getGitignore();
			expect(gitignore).toContain('.svelte-kit');
		});

		it('ignores .env files', () => {
			const gitignore = getGitignore();
			expect(gitignore).toContain('.env');
		});

		it('keeps .env.example', () => {
			const gitignore = getGitignore();
			expect(gitignore).toContain('!.env.example');
		});
	});

	describe('getAppCss', () => {
		it('imports Tailwind', () => {
			const css = getAppCss();
			expect(css).toContain('@import "tailwindcss"');
		});

		it('includes base layer styles', () => {
			const css = getAppCss();
			expect(css).toContain('@layer base');
		});

		it('includes component styles', () => {
			const css = getAppCss();
			expect(css).toContain('@layer components');
			expect(css).toContain('.card');
			expect(css).toContain('.btn');
		});

		it('includes grid background', () => {
			const css = getAppCss();
			expect(css).toContain('background-size: 48px 48px');
		});
	});

	describe('getAppHtml', () => {
		it('includes doctype', () => {
			const html = getAppHtml(baseConfig);
			expect(html).toContain('<!doctype html>');
		});

		it('includes SvelteKit placeholders', () => {
			const html = getAppHtml(baseConfig);
			expect(html).toContain('%sveltekit.head%');
			expect(html).toContain('%sveltekit.body%');
		});

		it('includes viewport meta', () => {
			const html = getAppHtml(baseConfig);
			expect(html).toContain('viewport');
			expect(html).toContain('width=device-width');
		});

		it('sets lang attribute', () => {
			const html = getAppHtml(baseConfig);
			expect(html).toContain('lang="en"');
		});
	});

	describe('getAppDts', () => {
		it('declares global App namespace', () => {
			const dts = getAppDts();
			expect(dts).toContain('namespace App');
		});

		it('includes standard interfaces as comments', () => {
			const dts = getAppDts();
			expect(dts).toContain('interface Error');
			expect(dts).toContain('interface Locals');
			expect(dts).toContain('interface PageData');
		});
	});
});
