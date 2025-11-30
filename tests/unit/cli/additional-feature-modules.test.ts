import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { modules } from '../../../src/cli/modules';
import { featureModules } from '../../../src/cli/modules/features';
import type { ProjectConfig } from '../../../src/cli/modules/types';

describe('Additional Feature Modules', () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = join(tmpdir(), `cleanroom-additional-feature-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	const baseConfig: ProjectConfig = {
		projectName: 'Test App',
		logo: { type: 'emoji', value: '🚀' },
		siteType: 'ssr-site',
		modules: [],
		github: { repoUrl: 'https://github.com/test/test-app' },
		cloudflare: { configured: false },
		domain: { hasDomain: false, configured: false }
	};

	// Helper to generate base SSR site first
	async function generateBaseSite(config: ProjectConfig): Promise<void> {
		await modules['ssr-site'].generate(config, testDir);
	}

	describe('leaderboard module', () => {
		it('creates leaderboard routes', async () => {
			const config = { ...baseConfig, modules: ['leaderboard'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['leaderboard'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'routes', 'leaderboard', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'leaderboard', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'leaderboard', 'scores', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'leaderboard', 'scores', '+page.server.ts'))).resolves.toBeUndefined();
		});

		it('game page has click game structure', async () => {
			const config = { ...baseConfig, modules: ['leaderboard'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['leaderboard'].apply(config, testDir);

			const gamePage = await readFile(join(testDir, 'src', 'routes', 'leaderboard', '+page.svelte'), 'utf-8');
			expect(gamePage).toContain('Click Game');
			expect(gamePage).toContain('gameState');
			expect(gamePage).toContain('startGame');
			expect(gamePage).toContain('handleClick');
		});

		it('scores page displays leaderboard', async () => {
			const config = { ...baseConfig, modules: ['leaderboard'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['leaderboard'].apply(config, testDir);

			const scoresPage = await readFile(join(testDir, 'src', 'routes', 'leaderboard', 'scores', '+page.svelte'), 'utf-8');
			expect(scoresPage).toContain('Leaderboard');
			expect(scoresPage).toContain('data.scores');
		});

		it('adds required dependencies', async () => {
			const config = { ...baseConfig, modules: ['leaderboard'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['leaderboard'].apply(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);
			expect(pkg.dependencies['lucide-svelte']).toBeDefined();
			expect(pkg.dependencies['svelte-sonner']).toBeDefined();
		});
	});

	describe('lobby module', () => {
		it('creates lobby route', async () => {
			const config = { ...baseConfig, modules: ['lobby'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['lobby'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'routes', 'lobby', '+page.svelte'))).resolves.toBeUndefined();
		});

		it('lobby page has video room structure', async () => {
			const config = { ...baseConfig, modules: ['lobby'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['lobby'].apply(config, testDir);

			const lobbyPage = await readFile(join(testDir, 'src', 'routes', 'lobby', '+page.svelte'), 'utf-8');
			expect(lobbyPage).toContain('Meditation Lobby');
			expect(lobbyPage).toContain('Video');
			expect(lobbyPage).toContain('joinRoom');
			expect(lobbyPage).toContain('leaveRoom');
		});

		it('lobby mentions Daily.co setup', async () => {
			const config = { ...baseConfig, modules: ['lobby'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['lobby'].apply(config, testDir);

			const lobbyPage = await readFile(join(testDir, 'src', 'routes', 'lobby', '+page.svelte'), 'utf-8');
			expect(lobbyPage).toContain('daily.co');
			expect(lobbyPage).toContain('DAILY_API_KEY');
		});

		it('adds @daily-co/daily-js dependency', async () => {
			const config = { ...baseConfig, modules: ['lobby'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['lobby'].apply(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);
			expect(pkg.dependencies['@daily-co/daily-js']).toBeDefined();
		});
	});

	describe('store module', () => {
		it('creates store routes', async () => {
			const config = { ...baseConfig, modules: ['store'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['store'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'routes', 'store', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'store', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'store', '[slug]', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'store', '[slug]', '+page.server.ts'))).resolves.toBeUndefined();
		});

		it('creates ProductCard components', async () => {
			const config = { ...baseConfig, modules: ['store'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['store'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCard.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCardImage.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCardPrice.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'lib', 'components', 'ui', 'product-card', 'index.ts'))).resolves.toBeUndefined();
		});

		it('creates seed script', async () => {
			const config = { ...baseConfig, modules: ['store'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['store'].apply(config, testDir);

			await expect(access(join(testDir, 'scripts', 'seed-store.ts'))).resolves.toBeUndefined();

			const seedScript = await readFile(join(testDir, 'scripts', 'seed-store.ts'), 'utf-8');
			expect(seedScript).toContain('categories');
			expect(seedScript).toContain('products');
		});

		it('adds db scripts to package.json', async () => {
			const config = { ...baseConfig, modules: ['store'] as ProjectConfig['modules'] };
			await generateBaseSite(config);
			await featureModules['store'].apply(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);
			expect(pkg.scripts['db:seed-store']).toBeDefined();
		});
	});

	describe('tracker module', () => {
		it('module exists and has apply function', () => {
			expect(featureModules['tracker']).toBeDefined();
			expect(featureModules['tracker'].name).toBe('tracker');
			expect(typeof featureModules['tracker'].apply).toBe('function');
		});
	});

	describe('widgets module', () => {
		it('module exists and has apply function', () => {
			expect(featureModules['widgets']).toBeDefined();
			expect(featureModules['widgets'].name).toBe('widgets');
			expect(typeof featureModules['widgets'].apply).toBe('function');
		});
	});

	describe('videos module', () => {
		it('module exists and has apply function', () => {
			expect(featureModules['videos']).toBeDefined();
			expect(featureModules['videos'].name).toBe('videos');
			expect(typeof featureModules['videos'].apply).toBe('function');
		});
	});

	describe('resume module', () => {
		it('module exists and has apply function', () => {
			expect(featureModules['resume']).toBeDefined();
			expect(featureModules['resume'].name).toBe('resume');
			expect(typeof featureModules['resume'].apply).toBe('function');
		});
	});

	describe('theme-preview module', () => {
		it('module exists and has apply function', () => {
			expect(featureModules['theme-preview']).toBeDefined();
			expect(featureModules['theme-preview'].name).toBe('theme-preview');
			expect(typeof featureModules['theme-preview'].apply).toBe('function');
		});
	});

	describe('all feature modules registration', () => {
		it('all 12 modules are registered', () => {
			const expectedModules = [
				'auth',
				'blog',
				'dark-toggle',
				'leaderboard',
				'lobby',
				'office-users',
				'resume',
				'store',
				'theme-preview',
				'tracker',
				'videos',
				'widgets'
			];

			for (const name of expectedModules) {
				expect(featureModules[name]).toBeDefined();
				expect(featureModules[name].name).toBe(name);
				expect(typeof featureModules[name].apply).toBe('function');
			}
		});

		it('all modules have name property matching key', () => {
			for (const [key, module] of Object.entries(featureModules)) {
				expect(module.name).toBe(key);
			}
		});
	});
});
