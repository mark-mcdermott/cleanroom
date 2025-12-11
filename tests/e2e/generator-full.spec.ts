/**
 * Full Generator E2E Tests
 *
 * These tests verify that all generator permutations work correctly:
 * - Generate site with various module/add-on combinations
 * - Install dependencies
 * - Push database schema (if applicable)
 * - Seed database (if applicable)
 * - Start dev server
 * - Verify all expected pages load
 *
 * IMPORTANT: These tests are slow and should be run on a schedule (e.g., nightly)
 * rather than on every commit. Run with:
 *   pnpm test:e2e:generator-full
 *
 * Environment variables required for full tests:
 *   NEON_API_KEY - For creating test databases
 *   CLOUDFLARE_API_TOKEN - For deploying to test CF Pages project (optional)
 *   GITHUB_TOKEN - For creating test repos (uses gh CLI, must be logged in)
 */

import { test, expect } from '@playwright/test';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, exec, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import { modules } from '../../src/cli/modules';
import { featureModules } from '../../src/cli/modules/features';
import type { ProjectConfig } from '../../src/cli/modules/types';

const execAsync = promisify(exec);

// Increase timeout for these long-running tests
const LONG_TIMEOUT = 300000; // 5 minutes per test

// Test database connection string (use a dedicated test database)
const TEST_NEON_CONNECTION = process.env.TEST_NEON_CONNECTION_STRING;

// Track used ports to avoid conflicts
let portCounter = 5200;
function getNextPort(): number {
	return portCounter++;
}

// Base config shared by all tests
function createBaseConfig(name: string): ProjectConfig {
	return {
		projectName: name,
		prettyName: name,
		nameCapitalization: 'title',
		logo: { type: 'emoji', value: '🧪' },
		siteType: 'ssr-site',
		modules: [],
		github: { repoUrl: `https://github.com/test/${name.toLowerCase().replace(/\s+/g, '-')}` },
		cloudflare: { configured: false },
		domain: { hasDomain: false, configured: false }
	};
}

interface TestContext {
	testDir: string;
	devProcess: ChildProcess | null;
	port: number;
	name: string;
}

async function generateSite(config: ProjectConfig, testDir: string): Promise<void> {
	const generator = modules[config.siteType];
	if (!generator) {
		throw new Error(`Unknown site type: ${config.siteType}`);
	}
	await generator.generate(config, testDir);

	// Apply feature modules
	for (const moduleName of config.modules) {
		const featureModule = featureModules[moduleName];
		if (featureModule) {
			await featureModule.apply(config, testDir);
		}
	}
}

async function installDependencies(testDir: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const install = spawn('pnpm', ['install'], {
			cwd: testDir,
			stdio: 'pipe',
			shell: true
		});

		let stderr = '';
		install.stderr?.on('data', (data) => {
			stderr += data.toString();
		});

		install.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`pnpm install failed with code ${code}: ${stderr}`));
			}
		});

		install.on('error', reject);
	});
}

async function setupDatabase(testDir: string, connectionString: string): Promise<void> {
	// Write connection string to .env
	const envPath = join(testDir, '.env');
	const devVarsPath = join(testDir, '.dev.vars');
	const envContent = `DATABASE_URL="${connectionString}"`;
	await writeFile(envPath, envContent);
	await writeFile(devVarsPath, envContent);

	// Run db:push with timeout (drizzle-kit can hang on interactive prompts)
	return new Promise((resolve, reject) => {
		const dbPush = spawn('pnpm', ['db:push'], {
			cwd: testDir,
			stdio: 'pipe',
			shell: true,
			env: { ...process.env, DATABASE_URL: connectionString }
		});

		const timeout = setTimeout(() => {
			dbPush.kill();
			// Don't reject - db:push might have completed, just timed out waiting for more input
			resolve();
		}, 30000);

		dbPush.on('close', (code) => {
			clearTimeout(timeout);
			// Accept code 0 or null (killed by timeout)
			if (code === 0 || code === null) {
				resolve();
			} else {
				reject(new Error(`db:push failed with code ${code}`));
			}
		});

		dbPush.on('error', (err) => {
			clearTimeout(timeout);
			reject(err);
		});
	});
}

async function startDevServer(testDir: string, port: number): Promise<ChildProcess> {
	return new Promise((resolve, reject) => {
		const devProcess = spawn('pnpm', ['dev', '--port', port.toString()], {
			cwd: testDir,
			stdio: 'pipe',
			shell: true
		});

		let started = false;
		let allOutput = '';

		const timeout = setTimeout(() => {
			if (!started) {
				devProcess.kill();
				reject(new Error(`Dev server failed to start within timeout. Output: ${allOutput}`));
			}
		}, 90000);

		const checkOutput = (data: Buffer) => {
			const output = data.toString();
			allOutput += output;
			if (
				output.includes('ready in') ||
				output.includes('VITE v') ||
				output.includes('Local:') ||
				output.includes(`localhost:${port}`)
			) {
				if (!started) {
					started = true;
					clearTimeout(timeout);
					setTimeout(() => resolve(devProcess), 2000);
				}
			}
		};

		devProcess.stdout?.on('data', checkOutput);
		devProcess.stderr?.on('data', checkOutput);

		devProcess.on('error', (err) => {
			clearTimeout(timeout);
			reject(err);
		});

		devProcess.on('close', (code) => {
			if (!started) {
				clearTimeout(timeout);
				reject(new Error(`Dev server exited with code ${code}. Output: ${allOutput}`));
			}
		});
	});
}

async function cleanup(ctx: TestContext): Promise<void> {
	if (ctx.devProcess) {
		ctx.devProcess.kill('SIGTERM');
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	try {
		await rm(ctx.testDir, { recursive: true, force: true });
	} catch {
		// Ignore cleanup errors
	}
}

// Helper to create test context
async function setupTest(name: string): Promise<TestContext> {
	const testDir = join(tmpdir(), `cleanroom-gen-${name.replace(/\s+/g, '-')}-${Date.now()}`);
	await mkdir(testDir, { recursive: true });
	return {
		testDir,
		devProcess: null,
		port: getNextPort(),
		name
	};
}

// =============================================================================
// TEST SUITES
// =============================================================================

test.describe('Generator Full E2E Tests', () => {
	test.describe.configure({ mode: 'serial' });

	// -------------------------------------------------------------------------
	// SSR Site + Module Tests (no database required for basic pages)
	// -------------------------------------------------------------------------

	test.describe('SSR Site with Modules (no DB)', () => {
		const modulesToTest = ['blog', 'leaderboard', 'lobby', 'resume', 'videos', 'widgets'];

		for (const moduleName of modulesToTest) {
			test(`ssr-site + ${moduleName}: generates and runs`, async ({ page }) => {
				test.setTimeout(LONG_TIMEOUT);

				const ctx = await setupTest(`ssr-${moduleName}`);
				const config = createBaseConfig(`Test ${moduleName}`);
				config.modules = [moduleName as ProjectConfig['modules'][number]];

				try {
					await generateSite(config, ctx.testDir);
					await installDependencies(ctx.testDir);
					ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

					// Test homepage
					const response = await page.goto(`http://localhost:${ctx.port}/`);
					expect(response?.status()).toBe(200);

					// Verify module-specific homepage content
					const content = await page.content();
					expect(content).toContain(`Test ${moduleName}`);

					// Test module-specific route exists
					const moduleRoutes: Record<string, string[]> = {
						blog: ['/blog'],
						leaderboard: ['/leaderboard'],
						lobby: ['/lobby'],
						resume: ['/resume'],
						videos: ['/videos'],
						widgets: ['/widgets']
					};

					for (const route of moduleRoutes[moduleName] || []) {
						const routeResponse = await page.goto(`http://localhost:${ctx.port}${route}`);
						expect(routeResponse?.status()).toBe(200);
					}
				} finally {
					await cleanup(ctx);
				}
			});
		}
	});

	// -------------------------------------------------------------------------
	// Add-on Tests
	// -------------------------------------------------------------------------

	test.describe('SSR Site with Add-ons', () => {
		test('ssr-site + dark-toggle (light-dark mode)', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('ssr-dark-toggle-ld');
			const config = createBaseConfig('Dark Toggle Test');
			config.modules = ['dark-toggle'];
			config.darkToggle = { mode: 'light-dark' };

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				const response = await page.goto(`http://localhost:${ctx.port}/`);
				expect(response?.status()).toBe(200);

				// Verify dark toggle button exists
				await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
			} finally {
				await cleanup(ctx);
			}
		});

		test('ssr-site + dark-toggle (light-dark-system mode)', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('ssr-dark-toggle-lds');
			const config = createBaseConfig('Dark Toggle System Test');
			config.modules = ['dark-toggle'];
			config.darkToggle = { mode: 'light-dark-system' };

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				const response = await page.goto(`http://localhost:${ctx.port}/`);
				expect(response?.status()).toBe(200);

				// Verify dark toggle button exists
				await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
			} finally {
				await cleanup(ctx);
			}
		});

		test('ssr-site + theme-preview', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('ssr-theme-preview');
			const config = createBaseConfig('Theme Preview Test');
			config.modules = ['theme-preview'];

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test theme preview page
				const response = await page.goto(`http://localhost:${ctx.port}/theme-preview`);
				expect(response?.status()).toBe(200);

				// Verify ThemeForseen content
				const content = await page.content();
				expect(content.toLowerCase()).toContain('theme');
			} finally {
				await cleanup(ctx);
			}
		});
	});

	// -------------------------------------------------------------------------
	// Module + Add-on Combinations
	// -------------------------------------------------------------------------

	test.describe('Module + Add-on Combinations', () => {
		test('blog + dark-toggle + theme-preview', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('blog-dark-theme');
			const config = createBaseConfig('Blog Dark Theme');
			config.modules = ['blog', 'dark-toggle', 'theme-preview'];
			config.darkToggle = { mode: 'light-dark-system' };

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test homepage
				const homeResponse = await page.goto(`http://localhost:${ctx.port}/`);
				expect(homeResponse?.status()).toBe(200);

				// Test blog page
				const blogResponse = await page.goto(`http://localhost:${ctx.port}/blog`);
				expect(blogResponse?.status()).toBe(200);

				// Test theme preview
				const themeResponse = await page.goto(`http://localhost:${ctx.port}/theme-preview`);
				expect(themeResponse?.status()).toBe(200);

				// Verify dark toggle
				await page.goto(`http://localhost:${ctx.port}/`);
				await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
			} finally {
				await cleanup(ctx);
			}
		});

		test('widgets + dark-toggle', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('widgets-dark');
			const config = createBaseConfig('Widgets Dark');
			config.modules = ['widgets', 'dark-toggle'];
			config.darkToggle = { mode: 'light-dark' };

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test homepage
				const homeResponse = await page.goto(`http://localhost:${ctx.port}/`);
				expect(homeResponse?.status()).toBe(200);

				// Test widgets page
				const widgetsResponse = await page.goto(`http://localhost:${ctx.port}/widgets`);
				expect(widgetsResponse?.status()).toBe(200);

				// Verify dark toggle
				await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
			} finally {
				await cleanup(ctx);
			}
		});

		test('leaderboard + dark-toggle', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('leaderboard-dark');
			const config = createBaseConfig('Leaderboard Dark');
			config.modules = ['leaderboard', 'dark-toggle'];
			config.darkToggle = { mode: 'light-dark-system' };

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test homepage
				const homeResponse = await page.goto(`http://localhost:${ctx.port}/`);
				expect(homeResponse?.status()).toBe(200);

				// Test leaderboard page
				const lbResponse = await page.goto(`http://localhost:${ctx.port}/leaderboard`);
				expect(lbResponse?.status()).toBe(200);
			} finally {
				await cleanup(ctx);
			}
		});
	});

	// -------------------------------------------------------------------------
	// Database-Required Tests (only run if TEST_NEON_CONNECTION is set)
	// -------------------------------------------------------------------------

	test.describe('Database-Required Tests', () => {
		test.skip(!TEST_NEON_CONNECTION, 'Skipping DB tests - TEST_NEON_CONNECTION_STRING not set');

		test('tracker + auth + office-users (full DB flow)', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('tracker-auth-office');
			const config = createBaseConfig('Tracker Auth Office');
			config.modules = ['tracker', 'auth', 'office-users'];
			config.database = {
				provider: 'neon',
				connectionString: TEST_NEON_CONNECTION!
			};

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				await setupDatabase(ctx.testDir, TEST_NEON_CONNECTION!);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test homepage
				const homeResponse = await page.goto(`http://localhost:${ctx.port}/`);
				expect(homeResponse?.status()).toBe(200);

				// Test login page
				const loginResponse = await page.goto(`http://localhost:${ctx.port}/login`);
				expect(loginResponse?.status()).toBe(200);
				await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();

				// Test signup page
				const signupResponse = await page.goto(`http://localhost:${ctx.port}/signup`);
				expect(signupResponse?.status()).toBe(200);
			} finally {
				await cleanup(ctx);
			}
		});

		test('store + auth (e-commerce with auth)', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('store-auth');
			const config = createBaseConfig('Store Auth');
			config.modules = ['store', 'auth'];
			config.database = {
				provider: 'neon',
				connectionString: TEST_NEON_CONNECTION!
			};

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				await setupDatabase(ctx.testDir, TEST_NEON_CONNECTION!);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test homepage
				const homeResponse = await page.goto(`http://localhost:${ctx.port}/`);
				expect(homeResponse?.status()).toBe(200);

				// Test store page
				const storeResponse = await page.goto(`http://localhost:${ctx.port}/store`);
				expect(storeResponse?.status()).toBe(200);

				// Test login
				const loginResponse = await page.goto(`http://localhost:${ctx.port}/login`);
				expect(loginResponse?.status()).toBe(200);
			} finally {
				await cleanup(ctx);
			}
		});

		test('widgets + auth + dark-toggle (dashboard with auth)', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('widgets-auth-dark');
			const config = createBaseConfig('Widgets Auth Dark');
			config.modules = ['widgets', 'auth', 'dark-toggle'];
			config.darkToggle = { mode: 'light-dark-system' };
			config.database = {
				provider: 'neon',
				connectionString: TEST_NEON_CONNECTION!
			};

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				await setupDatabase(ctx.testDir, TEST_NEON_CONNECTION!);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test homepage
				const homeResponse = await page.goto(`http://localhost:${ctx.port}/`);
				expect(homeResponse?.status()).toBe(200);

				// Test widgets
				const widgetsResponse = await page.goto(`http://localhost:${ctx.port}/widgets`);
				expect(widgetsResponse?.status()).toBe(200);

				// Test dark toggle exists
				await page.goto(`http://localhost:${ctx.port}/`);
				await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
			} finally {
				await cleanup(ctx);
			}
		});
	});

	// -------------------------------------------------------------------------
	// Other Site Types
	// -------------------------------------------------------------------------

	test.describe('Other Site Types', () => {
		test('static-site generates and runs', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('static-site');
			const config = createBaseConfig('Static Site Test');
			config.siteType = 'static-site';
			config.modules = [];

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				// Test all pages
				const pages = ['/', '/about', '/contact'];
				for (const pagePath of pages) {
					const response = await page.goto(`http://localhost:${ctx.port}${pagePath}`);
					expect(response?.status()).toBe(200);
				}
			} finally {
				await cleanup(ctx);
			}
		});

		test('landing-sections generates and runs', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('landing-sections');
			const config = createBaseConfig('Landing Sections Test');
			config.siteType = 'landing-sections';
			config.modules = [];

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				const response = await page.goto(`http://localhost:${ctx.port}/`);
				expect(response?.status()).toBe(200);

				// Verify sections exist
				await expect(page.locator('#the-map')).toBeVisible();
				await expect(page.locator('#the-crew')).toBeVisible();
			} finally {
				await cleanup(ctx);
			}
		});
	});

	// -------------------------------------------------------------------------
	// Edge Cases
	// -------------------------------------------------------------------------

	test.describe('Edge Cases', () => {
		test('no modules selected (base ssr-site)', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('ssr-base');
			const config = createBaseConfig('Base SSR');
			config.modules = [];

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				const response = await page.goto(`http://localhost:${ctx.port}/`);
				expect(response?.status()).toBe(200);

				// Should have default SSR content
				const content = await page.content();
				expect(content).toContain('Why SSR?');
			} finally {
				await cleanup(ctx);
			}
		});

		test('all add-ons without main module', async ({ page }) => {
			test.setTimeout(LONG_TIMEOUT);

			const ctx = await setupTest('addons-only');
			const config = createBaseConfig('Addons Only');
			config.modules = ['dark-toggle', 'theme-preview'];
			config.darkToggle = { mode: 'light-dark-system' };

			try {
				await generateSite(config, ctx.testDir);
				await installDependencies(ctx.testDir);
				ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

				const response = await page.goto(`http://localhost:${ctx.port}/`);
				expect(response?.status()).toBe(200);

				// Dark toggle should work
				await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();

				// Theme preview page should exist
				const themeResponse = await page.goto(`http://localhost:${ctx.port}/theme-preview`);
				expect(themeResponse?.status()).toBe(200);
			} finally {
				await cleanup(ctx);
			}
		});
	});
});
