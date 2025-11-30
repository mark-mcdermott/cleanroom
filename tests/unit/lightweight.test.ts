import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { hashPassword, verifyPassword } from '../../src/lib/server/password';
import { modules } from '../../src/cli/modules';
import { featureModules } from '../../src/cli/modules/features';
import type { ProjectConfig } from '../../src/cli/modules/types';

/**
 * Lightweight Unit Test Suite
 *
 * The 20 most valuable unit tests for quick regression checks.
 * Run with: pnpm test:unit:lightweight
 */

describe('Lightweight Unit Suite', () => {
	// === PASSWORD SECURITY ===

	describe('Password Hashing', () => {
		it('hashes passwords correctly', async () => {
			const password = 'testpassword123';
			const hash = await hashPassword(password);
			expect(hash).not.toBe(password);
			expect(hash.length).toBeGreaterThan(50);
		});

		it('verifies correct passwords', async () => {
			const password = 'correctpassword';
			const hash = await hashPassword(password);
			const result = await verifyPassword(hash, password);
			expect(result).toBe(true);
		});

		it('rejects incorrect passwords', async () => {
			const hash = await hashPassword('correctpassword');
			const result = await verifyPassword(hash, 'wrongpassword');
			expect(result).toBe(false);
		});

		it('generates unique hashes for same password', async () => {
			const password = 'samepassword';
			const hash1 = await hashPassword(password);
			const hash2 = await hashPassword(password);
			expect(hash1).not.toBe(hash2);
		});
	});

	// === CLI SITE GENERATORS ===

	describe('Site Generators', () => {
		let testDir: string;

		beforeEach(async () => {
			testDir = join(tmpdir(), `cleanroom-lightweight-test-${Date.now()}`);
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

		it('ssr-site generator exists', () => {
			expect(modules['ssr-site']).toBeDefined();
			expect(typeof modules['ssr-site'].generate).toBe('function');
		});

		it('static-site generator exists', () => {
			expect(modules['static-site']).toBeDefined();
			expect(typeof modules['static-site'].generate).toBe('function');
		});

		it('landing-sections generator exists', () => {
			expect(modules['landing-sections']).toBeDefined();
			expect(typeof modules['landing-sections'].generate).toBe('function');
		});

		it('generates package.json for ssr-site', async () => {
			await modules['ssr-site'].generate(baseConfig, testDir);
			await expect(access(join(testDir, 'package.json'))).resolves.toBeUndefined();
		});

		it('generates svelte.config.js for ssr-site', async () => {
			await modules['ssr-site'].generate(baseConfig, testDir);
			await expect(access(join(testDir, 'svelte.config.js'))).resolves.toBeUndefined();
		});

		it('generates src directory for ssr-site', async () => {
			await modules['ssr-site'].generate(baseConfig, testDir);
			await expect(access(join(testDir, 'src'))).resolves.toBeUndefined();
		});
	});

	// === FEATURE MODULES ===

	describe('Feature Modules', () => {
		it('auth module exists', () => {
			expect(featureModules['auth']).toBeDefined();
			expect(featureModules['auth'].name).toBe('auth');
			expect(typeof featureModules['auth'].apply).toBe('function');
		});

		it('blog module exists', () => {
			expect(featureModules['blog']).toBeDefined();
			expect(featureModules['blog'].name).toBe('blog');
			expect(typeof featureModules['blog'].apply).toBe('function');
		});

		it('dark-toggle module exists', () => {
			expect(featureModules['dark-toggle']).toBeDefined();
			expect(featureModules['dark-toggle'].name).toBe('dark-toggle');
		});

		it('store module exists', () => {
			expect(featureModules['store']).toBeDefined();
			expect(featureModules['store'].name).toBe('store');
		});

		it('tracker module exists', () => {
			expect(featureModules['tracker']).toBeDefined();
			expect(featureModules['tracker'].name).toBe('tracker');
		});

		it('widgets module exists', () => {
			expect(featureModules['widgets']).toBeDefined();
			expect(featureModules['widgets'].name).toBe('widgets');
		});

		it('all 12 feature modules are registered', () => {
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
			}
		});
	});
});
