import { test, expect } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, type ChildProcess } from 'node:child_process';
import { modules } from '../../src/cli/modules';
import type { ProjectConfig } from '../../src/cli/modules/types';

const TIMEOUT = 180000; // 3 minutes for install + dev server startup

const baseConfig: ProjectConfig = {
	projectName: 'Test App',
	logo: { type: 'emoji', value: '🚀' },
	siteType: 'demo-page',
	modules: [],
	github: { repoUrl: 'https://github.com/test/test-app' },
	cloudflare: { configured: false },
	domain: { hasDomain: false, configured: false }
};

interface TestContext {
	testDir: string;
	devProcess: ChildProcess | null;
	port: number;
}

async function setupGeneratedSite(
	moduleName: keyof typeof modules,
	port: number
): Promise<TestContext> {
	const testDir = join(tmpdir(), `cleanroom-e2e-${moduleName}-${Date.now()}`);
	await mkdir(testDir, { recursive: true });

	const config: ProjectConfig = { ...baseConfig, siteType: moduleName as ProjectConfig['siteType'] };
	await modules[moduleName].generate(config, testDir);

	return { testDir, devProcess: null, port };
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
			// Vite outputs "VITE v5.x.x  ready" or "ready in Xms" when server is up
			if (
				output.includes('ready in') ||
				output.includes('VITE v') ||
				output.includes('Local:') ||
				output.includes(`localhost:${port}`)
			) {
				if (!started) {
					started = true;
					clearTimeout(timeout);
					// Give it a moment to fully initialize
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
		// Wait a bit for process to terminate
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	try {
		await rm(ctx.testDir, { recursive: true, force: true });
	} catch {
		// Ignore cleanup errors
	}
}

test.describe('CLI Generator Integration Tests', () => {
	test.describe.configure({ mode: 'serial' });

	// Use different ports for each test to avoid conflicts
	const ports = {
		'demo-page': 5180,
		'landing-simple': 5181,
		'landing-sections': 5182,
		'static-site': 5183
	};

	test('demo-page: generates, installs, runs dev server, homepage returns 200', async ({
		page
	}) => {
		test.setTimeout(TIMEOUT);

		const ctx = await setupGeneratedSite('demo-page', ports['demo-page']);

		try {
			await installDependencies(ctx.testDir);
			ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

			const response = await page.goto(`http://localhost:${ctx.port}/`);
			expect(response?.status()).toBe(200);

			// Verify page content loaded
			await expect(page.locator('body')).toBeVisible();
			// Check for the emoji or project name
			const content = await page.content();
			expect(content).toContain('Test App');
		} finally {
			await cleanup(ctx);
		}
	});

	test('landing-simple: generates, installs, runs dev server, homepage returns 200', async ({
		page
	}) => {
		test.setTimeout(TIMEOUT);

		const ctx = await setupGeneratedSite('landing-simple', ports['landing-simple']);

		try {
			await installDependencies(ctx.testDir);
			ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

			const response = await page.goto(`http://localhost:${ctx.port}/`);
			expect(response?.status()).toBe(200);

			// Verify page content loaded
			await expect(page.locator('body')).toBeVisible();
			const content = await page.content();
			expect(content).toContain('Test App');
		} finally {
			await cleanup(ctx);
		}
	});

	test('landing-sections: generates, installs, runs dev server, homepage returns 200', async ({
		page
	}) => {
		test.setTimeout(TIMEOUT);

		const ctx = await setupGeneratedSite('landing-sections', ports['landing-sections']);

		try {
			await installDependencies(ctx.testDir);
			ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

			const response = await page.goto(`http://localhost:${ctx.port}/`);
			expect(response?.status()).toBe(200);

			// Verify page content loaded - landing-sections should have nav and sections
			await expect(page.locator('body')).toBeVisible();
			const content = await page.content();
			expect(content).toContain('Test App');

			// Verify sections exist (Willy Wombat pirate story)
			await expect(page.locator('#the-map')).toBeVisible();
			await expect(page.locator('#the-crew')).toBeVisible();
			await expect(page.locator('#the-voyage')).toBeVisible();
			await expect(page.locator('#the-treasure')).toBeVisible();
		} finally {
			await cleanup(ctx);
		}
	});

	test('static-site: generates, installs, runs dev server, homepage returns 200', async ({
		page
	}) => {
		test.setTimeout(TIMEOUT);

		const ctx = await setupGeneratedSite('static-site', ports['static-site']);

		try {
			await installDependencies(ctx.testDir);
			ctx.devProcess = await startDevServer(ctx.testDir, ctx.port);

			const response = await page.goto(`http://localhost:${ctx.port}/`);
			expect(response?.status()).toBe(200);

			// Verify page content loaded
			await expect(page.locator('body')).toBeVisible();
			const content = await page.content();
			expect(content).toContain('Test App');

			// Test navigation to other pages
			const aboutResponse = await page.goto(`http://localhost:${ctx.port}/about`);
			expect(aboutResponse?.status()).toBe(200);

			const contactResponse = await page.goto(`http://localhost:${ctx.port}/contact`);
			expect(contactResponse?.status()).toBe(200);
		} finally {
			await cleanup(ctx);
		}
	});
});
