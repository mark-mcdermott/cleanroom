import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { modules } from '../../../src/cli/modules';
import type { ProjectConfig } from '../../../src/cli/modules/types';

describe('Generator Modules', () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = join(tmpdir(), `cleanroom-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	const baseConfig: ProjectConfig = {
		projectName: 'Test App',
		logo: { type: 'emoji', value: '🚀' },
		siteType: 'demo-page',
		modules: [],
		github: { repoUrl: 'https://github.com/test/test-app' },
		cloudflare: { configured: false },
		domain: { hasDomain: false, configured: false }
	};

	describe('demo-page module', () => {
		it('generates required files', async () => {
			const config = { ...baseConfig, siteType: 'demo-page' as const };
			await modules['demo-page'].generate(config, testDir);

			// Check config files exist
			await expect(access(join(testDir, 'package.json'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'svelte.config.js'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'vite.config.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'tsconfig.json'))).resolves.toBeUndefined();
			await expect(access(join(testDir, '.gitignore'))).resolves.toBeUndefined();

			// Check app files exist
			await expect(access(join(testDir, 'src', 'app.css'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'app.html'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'app.d.ts'))).resolves.toBeUndefined();

			// Check route files exist
			await expect(access(join(testDir, 'src', 'routes', '+layout.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', '+page.svelte'))).resolves.toBeUndefined();
		});

		it('includes project name in package.json', async () => {
			const config = { ...baseConfig, siteType: 'demo-page' as const };
			await modules['demo-page'].generate(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);
			expect(pkg.name).toBe('test-app');
		});

		it('includes emoji in page content', async () => {
			const config = { ...baseConfig, siteType: 'demo-page' as const };
			await modules['demo-page'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('🚀');
			expect(page).toContain('Test App');
		});
	});

	describe('landing-simple module', () => {
		it('generates required files with footer', async () => {
			const config = { ...baseConfig, siteType: 'landing-simple' as const };
			await modules['landing-simple'].generate(config, testDir);

			await expect(access(join(testDir, 'package.json'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', '+layout.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', '+page.svelte'))).resolves.toBeUndefined();

			const layout = await readFile(join(testDir, 'src', 'routes', '+layout.svelte'), 'utf-8');
			expect(layout).toContain('footer');
		});
	});

	describe('landing-sections module', () => {
		it('generates required files with nav and sections', async () => {
			const config = { ...baseConfig, siteType: 'landing-sections' as const };
			await modules['landing-sections'].generate(config, testDir);

			await expect(access(join(testDir, 'package.json'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', '+layout.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', '+page.svelte'))).resolves.toBeUndefined();

			const layout = await readFile(join(testDir, 'src', 'routes', '+layout.svelte'), 'utf-8');
			expect(layout).toContain('mobileMenuOpen');
			expect(layout).toContain('nav');

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('id="the-map"');
			expect(page).toContain('id="the-crew"');
			expect(page).toContain('id="the-voyage"');
			expect(page).toContain('id="the-treasure"');
		});
	});

	describe('static-site module', () => {
		it('generates multiple pages', async () => {
			const config = { ...baseConfig, siteType: 'static-site' as const };
			await modules['static-site'].generate(config, testDir);

			// Check main routes
			await expect(access(join(testDir, 'src', 'routes', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'about', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'contact', '+page.svelte'))).resolves.toBeUndefined();
		});

		it('includes header with navigation', async () => {
			const config = { ...baseConfig, siteType: 'static-site' as const };
			await modules['static-site'].generate(config, testDir);

			const layout = await readFile(join(testDir, 'src', 'routes', '+layout.svelte'), 'utf-8');
			expect(layout).toContain('header');
			expect(layout).toContain('mobileMenuOpen');
			expect(layout).toContain('/about');
			expect(layout).toContain('/contact');
		});

		it('contact page has form', async () => {
			const config = { ...baseConfig, siteType: 'static-site' as const };
			await modules['static-site'].generate(config, testDir);

			const contact = await readFile(join(testDir, 'src', 'routes', 'contact', '+page.svelte'), 'utf-8');
			expect(contact).toContain('<form');
			expect(contact).toContain('name');
			expect(contact).toContain('email');
			expect(contact).toContain('message');
		});
	});

	describe('ssr-site module', () => {
		it('generates all required pages', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const };
			await modules['ssr-site'].generate(config, testDir);

			// Check main routes exist
			await expect(access(join(testDir, 'src', 'routes', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'about', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'services', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'contact', '+page.svelte'))).resolves.toBeUndefined();
		});

		it('includes header with 4-item navigation', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const };
			await modules['ssr-site'].generate(config, testDir);

			const layout = await readFile(join(testDir, 'src', 'routes', '+layout.svelte'), 'utf-8');
			expect(layout).toContain('header');
			expect(layout).toContain('mobileMenuOpen');
			expect(layout).toContain('/about');
			expect(layout).toContain('/services');
			expect(layout).toContain('/contact');
		});

		it('homepage has hero, features, and CTA sections', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			// Hero section
			expect(page).toContain('Test App');
			expect(page).toContain('server-side rendered');
			// Features section
			expect(page).toContain('Why SSR?');
			expect(page).toContain('Auth Ready');
			expect(page).toContain('Dynamic Content');
			expect(page).toContain('Secure by Default');
			// CTA section
			expect(page).toContain('Ready to Build?');
			expect(page).toContain('/services');
		});

		it('services page has service cards', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const };
			await modules['ssr-site'].generate(config, testDir);

			const services = await readFile(join(testDir, 'src', 'routes', 'services', '+page.svelte'), 'utf-8');
			expect(services).toContain('Services');
			expect(services).toContain('Web Development');
			expect(services).toContain('Mobile Apps');
			expect(services).toContain('Cloud Solutions');
			expect(services).toContain('Consulting');
		});

		it('contact page has form', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const };
			await modules['ssr-site'].generate(config, testDir);

			const contact = await readFile(join(testDir, 'src', 'routes', 'contact', '+page.svelte'), 'utf-8');
			expect(contact).toContain('<form');
			expect(contact).toContain('name');
			expect(contact).toContain('email');
			expect(contact).toContain('message');
		});

		it('does NOT include prerender layout (SSR mode)', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const };
			await modules['ssr-site'].generate(config, testDir);

			// SSR sites should NOT have +layout.ts with prerender = true
			await expect(access(join(testDir, 'src', 'routes', '+layout.ts'))).rejects.toThrow();
		});

		it('shows hero buttons when no modules selected', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: [] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('Learn More');
			expect(page).toContain('Get in Touch');
			expect(page).toContain('href="/about"');
			expect(page).toContain('href="/contact"');
		});

		it('hides hero buttons when modules are selected', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: ['auth'] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).not.toContain('Learn More');
			expect(page).not.toContain('Get in Touch');
		});

		it('shows Modules Added section with auth module', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: ['auth'] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('Modules Added');
			expect(page).toContain('🔐');
			expect(page).toContain('Authentication');
		});

		it('shows Modules Added section with blog module', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: ['blog'] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('Modules Added');
			expect(page).toContain('📝');
			expect(page).toContain('Blog');
		});

		it('shows Modules Added section with office-users module', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: ['office-users'] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('Modules Added');
			expect(page).toContain('👥');
			expect(page).toContain('The Office Users');
		});

		it('shows multiple modules in Modules Added section', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: ['auth', 'blog', 'office-users'] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).toContain('Modules Added');
			expect(page).toContain('🔐');
			expect(page).toContain('Authentication');
			expect(page).toContain('📝');
			expect(page).toContain('Blog');
			expect(page).toContain('👥');
			expect(page).toContain('The Office Users');
		});

		it('does not show Modules Added section when no modules selected', async () => {
			const config = { ...baseConfig, siteType: 'ssr-site' as const, modules: [] };
			await modules['ssr-site'].generate(config, testDir);

			const page = await readFile(join(testDir, 'src', 'routes', '+page.svelte'), 'utf-8');
			expect(page).not.toContain('Modules Added');
		});
	});

	describe('all modules', () => {
		it('all registered modules exist and have generate function', () => {
			const moduleNames = ['demo-page', 'landing-simple', 'landing-sections', 'static-site', 'ssr-site'];

			for (const name of moduleNames) {
				expect(modules[name]).toBeDefined();
				expect(modules[name].name).toBe(name);
				expect(typeof modules[name].generate).toBe('function');
			}
		});

		it('all modules create valid package.json with required scripts', async () => {
			const moduleNames = ['demo-page', 'landing-simple', 'landing-sections', 'static-site', 'ssr-site'] as const;

			for (const name of moduleNames) {
				const moduleTestDir = join(testDir, name);
				await mkdir(moduleTestDir, { recursive: true });

				const config = { ...baseConfig, siteType: name };
				await modules[name].generate(config, moduleTestDir);

				const packageJson = await readFile(join(moduleTestDir, 'package.json'), 'utf-8');
				const pkg = JSON.parse(packageJson);

				expect(pkg.scripts.dev).toBe('vite dev');
				expect(pkg.scripts.build).toBe('vite build');
				expect(pkg.scripts.preview).toBe('vite preview');
				expect(pkg.devDependencies['@sveltejs/adapter-cloudflare']).toBeDefined();
				expect(pkg.devDependencies['tailwindcss']).toBeDefined();
			}
		});

		it('all modules include Tailwind CSS import', async () => {
			const moduleNames = ['demo-page', 'landing-simple', 'landing-sections', 'static-site', 'ssr-site'] as const;

			for (const name of moduleNames) {
				const moduleTestDir = join(testDir, name);
				await mkdir(moduleTestDir, { recursive: true });

				const config = { ...baseConfig, siteType: name };
				await modules[name].generate(config, moduleTestDir);

				const appCss = await readFile(join(moduleTestDir, 'src', 'app.css'), 'utf-8');
				expect(appCss).toContain('@import "tailwindcss"');
			}
		});
	});
});
