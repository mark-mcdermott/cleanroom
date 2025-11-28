import { describe, it, expect } from 'vitest';
import {
	getPackageJson,
	getSvelteConfig,
	getViteConfig,
	getTsConfig,
	getGitignore,
	getAppCss,
	getAppHtml,
	getAppDts,
	getEmojiFaviconSvg,
	getFaviconExtension
} from '../../../src/cli/modules/base/files';
import type { ProjectConfig } from '../../../src/cli/modules/types';

describe('File Templates', () => {
	const baseConfig: ProjectConfig = {
		projectName: 'Test App',
		logo: { type: 'emoji', value: '🚀' },
		siteType: 'demo-page',
		modules: [],
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

		it('generates SVG data URL favicon for emoji logos', () => {
			const html = getAppHtml(baseConfig);
			expect(html).toContain('data:image/svg+xml');
			expect(html).toContain(encodeURIComponent('🚀'));
		});

		it('references favicon file for file logos', () => {
			const fileConfig = { ...baseConfig, logo: { type: 'file' as const, value: '/path/to/logo.png' } };
			const html = getAppHtml(fileConfig);
			expect(html).toContain('%sveltekit.assets%/favicon.png');
			expect(html).toContain('type="image/png"');
		});

		it('handles SVG file logos', () => {
			const svgConfig = { ...baseConfig, logo: { type: 'file' as const, value: '/path/to/logo.svg' } };
			const html = getAppHtml(svgConfig);
			expect(html).toContain('%sveltekit.assets%/favicon.svg');
			expect(html).toContain('type="image/svg+xml"');
		});

		it('handles JPG file logos', () => {
			const jpgConfig = { ...baseConfig, logo: { type: 'file' as const, value: '/path/to/logo.jpg' } };
			const html = getAppHtml(jpgConfig);
			expect(html).toContain('%sveltekit.assets%/favicon.jpeg');
			expect(html).toContain('type="image/jpeg"');
		});
	});

	describe('getEmojiFaviconSvg', () => {
		it('returns a data URL', () => {
			const svg = getEmojiFaviconSvg('🚀');
			expect(svg).toMatch(/^data:image\/svg\+xml,/);
		});

		it('contains the emoji', () => {
			const svg = getEmojiFaviconSvg('🎉');
			expect(svg).toContain(encodeURIComponent('🎉'));
		});

		it('creates valid SVG structure', () => {
			const svg = getEmojiFaviconSvg('✨');
			expect(svg).toContain(encodeURIComponent('<svg'));
			expect(svg).toContain(encodeURIComponent('</svg>'));
			expect(svg).toContain(encodeURIComponent('<text'));
		});

		it('handles different emojis', () => {
			const emojis = ['🔥', '💻', '🎨', '📱'];
			for (const emoji of emojis) {
				const svg = getEmojiFaviconSvg(emoji);
				expect(svg).toContain(encodeURIComponent(emoji));
			}
		});
	});

	describe('getFaviconExtension', () => {
		it('extracts png extension', () => {
			expect(getFaviconExtension('/path/to/logo.png')).toBe('png');
		});

		it('extracts svg extension', () => {
			expect(getFaviconExtension('/path/to/logo.svg')).toBe('svg');
		});

		it('normalizes jpg to jpeg', () => {
			expect(getFaviconExtension('/path/to/logo.jpg')).toBe('jpeg');
		});

		it('handles uppercase extensions', () => {
			expect(getFaviconExtension('/path/to/logo.PNG')).toBe('png');
			expect(getFaviconExtension('/path/to/logo.SVG')).toBe('svg');
			expect(getFaviconExtension('/path/to/logo.JPG')).toBe('jpeg');
		});

		it('defaults to png for no extension', () => {
			expect(getFaviconExtension('/path/to/logo')).toBe('png');
		});

		it('handles gif extension', () => {
			expect(getFaviconExtension('/path/to/logo.gif')).toBe('gif');
		});

		it('handles webp extension', () => {
			expect(getFaviconExtension('/path/to/logo.webp')).toBe('webp');
		});

		it('handles ico extension', () => {
			expect(getFaviconExtension('/path/to/logo.ico')).toBe('ico');
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
