import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { modules } from '../../../src/cli/modules';
import { featureModules } from '../../../src/cli/modules/features';
import type { ProjectConfig } from '../../../src/cli/modules/types';

describe('Feature Modules', () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = join(tmpdir(), `cleanroom-feature-test-${Date.now()}`);
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

	describe('auth module', () => {
		it('creates database schema files', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'lib', 'server', 'db', 'schema.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'lib', 'server', 'db', 'index.ts'))).resolves.toBeUndefined();
		});

		it('creates auth configuration', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'lib', 'server', 'auth.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'lib', 'server', 'password.ts'))).resolves.toBeUndefined();
		});

		it('creates login, signup, and logout routes', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'routes', 'login', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'login', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'signup', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'signup', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'logout', '+page.server.ts'))).resolves.toBeUndefined();
		});

		it('creates hooks.server.ts for session handling', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'hooks.server.ts'))).resolves.toBeUndefined();

			const hooks = await readFile(join(testDir, 'src', 'hooks.server.ts'), 'utf-8');
			expect(hooks).toContain('createLucia');
			expect(hooks).toContain('validateSession');
		});

		it('updates package.json with auth dependencies', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);

			expect(pkg.dependencies['lucia']).toBeDefined();
			expect(pkg.dependencies['@lucia-auth/adapter-drizzle']).toBeDefined();
			expect(pkg.dependencies['drizzle-orm']).toBeDefined();
			expect(pkg.dependencies['@neondatabase/serverless']).toBeDefined();
			expect(pkg.devDependencies['drizzle-kit']).toBeDefined();
		});

		it('creates drizzle.config.ts', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			await expect(access(join(testDir, 'drizzle.config.ts'))).resolves.toBeUndefined();

			const drizzleConfig = await readFile(join(testDir, 'drizzle.config.ts'), 'utf-8');
			expect(drizzleConfig).toContain('defineConfig');
			expect(drizzleConfig).toContain('postgresql');
		});

		it('schema includes users and sessions tables', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			const schema = await readFile(join(testDir, 'src', 'lib', 'server', 'db', 'schema.ts'), 'utf-8');
			expect(schema).toContain('users');
			expect(schema).toContain('sessions');
			expect(schema).toContain('pgTable');
		});

		it('password module uses PBKDF2', async () => {
			const config = { ...baseConfig, modules: ['auth'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			const password = await readFile(join(testDir, 'src', 'lib', 'server', 'password.ts'), 'utf-8');
			expect(password).toContain('PBKDF2');
			expect(password).toContain('hashPassword');
			expect(password).toContain('verifyPassword');
		});

		it('writes .env file when database config is provided', async () => {
			const config: ProjectConfig = {
				...baseConfig,
				modules: ['auth'],
				database: {
					provider: 'neon',
					connectionString: 'postgresql://test:test@localhost/test'
				}
			};
			await generateBaseSite(config);
			await featureModules['auth'].apply(config, testDir);

			await expect(access(join(testDir, '.env'))).resolves.toBeUndefined();

			const envFile = await readFile(join(testDir, '.env'), 'utf-8');
			expect(envFile).toContain('DATABASE_URL=postgresql://test:test@localhost/test');
		});
	});

	describe('blog module', () => {
		it('creates blog routes', async () => {
			const config = { ...baseConfig, modules: ['blog'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['blog'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'routes', 'blog', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'blog', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'blog', '[slug]', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'blog', '[slug]', '+page.svelte'))).resolves.toBeUndefined();
		});

		it('creates seed script', async () => {
			const config = { ...baseConfig, modules: ['blog'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['blog'].apply(config, testDir);

			await expect(access(join(testDir, 'scripts', 'seed-blog.ts'))).resolves.toBeUndefined();
		});

		it('updates package.json with seed script', async () => {
			const config = { ...baseConfig, modules: ['blog'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['blog'].apply(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);

			expect(pkg.scripts['db:seed-blog']).toBeDefined();
		});

		it('blog listing page shows posts', async () => {
			const config = { ...baseConfig, modules: ['blog'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['blog'].apply(config, testDir);

			const blogPage = await readFile(join(testDir, 'src', 'routes', 'blog', '+page.svelte'), 'utf-8');
			expect(blogPage).toContain('data.posts');
			expect(blogPage).toContain('Blog');
		});

		it('blog post page shows individual post', async () => {
			const config = { ...baseConfig, modules: ['blog'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['blog'].apply(config, testDir);

			const postPage = await readFile(join(testDir, 'src', 'routes', 'blog', '[slug]', '+page.svelte'), 'utf-8');
			expect(postPage).toContain('data.post');
		});
	});

	describe('office-users module', () => {
		it('creates seed script with Office characters', async () => {
			const config = { ...baseConfig, modules: ['office-users'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['office-users'].apply(config, testDir);

			await expect(access(join(testDir, 'scripts', 'seed-office.ts'))).resolves.toBeUndefined();

			const seedScript = await readFile(join(testDir, 'scripts', 'seed-office.ts'), 'utf-8');
			expect(seedScript).toContain('Michael Scott');
			expect(seedScript).toContain('Dwight Schrute');
			expect(seedScript).toContain('Jim Halpert');
			expect(seedScript).toContain('Pam Beesly');
			expect(seedScript).toContain('dundermifflin.com');
		});

		it('creates team listing page', async () => {
			const config = { ...baseConfig, modules: ['office-users'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['office-users'].apply(config, testDir);

			await expect(access(join(testDir, 'src', 'routes', 'team', '+page.server.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'team', '+page.svelte'))).resolves.toBeUndefined();
		});

		it('team page displays users', async () => {
			const config = { ...baseConfig, modules: ['office-users'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['office-users'].apply(config, testDir);

			const teamPage = await readFile(join(testDir, 'src', 'routes', 'team', '+page.svelte'), 'utf-8');
			expect(teamPage).toContain('data.users');
			expect(teamPage).toContain('The Team');
			expect(teamPage).toContain('Dunder Mifflin');
		});

		it('updates package.json with seed script', async () => {
			const config = { ...baseConfig, modules: ['office-users'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['office-users'].apply(config, testDir);

			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);

			expect(pkg.scripts['db:seed-office']).toBeDefined();
			expect(pkg.scripts['db:seed-office']).toContain('seed-office.ts');
		});

		it('seed script has 20 Office characters', async () => {
			const config = { ...baseConfig, modules: ['office-users'] as ('auth' | 'blog' | 'office-users')[] };
			await generateBaseSite(config);
			await featureModules['office-users'].apply(config, testDir);

			const seedScript = await readFile(join(testDir, 'scripts', 'seed-office.ts'), 'utf-8');

			// Check for key characters
			const characters = [
				'Michael Scott', 'Dwight Schrute', 'Jim Halpert', 'Pam Beesly',
				'Ryan Howard', 'Andy Bernard', 'Angela Martin', 'Kevin Malone',
				'Oscar Martinez', 'Stanley Hudson', 'Phyllis Vance', 'Meredith Palmer',
				'Creed Bratton', 'Kelly Kapoor', 'Toby Flenderson', 'Darryl Philbin',
				'Erin Hannon', 'Gabe Lewis', 'Holly Flax', 'Jan Levinson'
			];

			for (const character of characters) {
				expect(seedScript).toContain(character);
			}
		});
	});

	describe('all feature modules', () => {
		it('all registered modules exist and have apply function', () => {
			const moduleNames = ['auth', 'blog', 'office-users'];

			for (const name of moduleNames) {
				expect(featureModules[name]).toBeDefined();
				expect(featureModules[name].name).toBe(name);
				expect(typeof featureModules[name].apply).toBe('function');
			}
		});
	});

	describe('combined module application', () => {
		it('can apply auth + blog modules together', async () => {
			const config: ProjectConfig = {
				...baseConfig,
				modules: ['auth', 'blog'],
				database: {
					provider: 'neon',
					connectionString: 'postgresql://test:test@localhost/test'
				}
			};
			await generateBaseSite(config);

			// Apply auth first
			await featureModules['auth'].apply(config, testDir);
			// Then apply blog
			await featureModules['blog'].apply(config, testDir);

			// Auth files should exist
			await expect(access(join(testDir, 'src', 'lib', 'server', 'auth.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'login', '+page.svelte'))).resolves.toBeUndefined();

			// Blog files should exist
			await expect(access(join(testDir, 'src', 'routes', 'blog', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'blog', '[slug]', '+page.svelte'))).resolves.toBeUndefined();

			// Schema should include both users and posts tables
			const schema = await readFile(join(testDir, 'src', 'lib', 'server', 'db', 'schema.ts'), 'utf-8');
			expect(schema).toContain('users');
			expect(schema).toContain('sessions');
			expect(schema).toContain('posts');
			expect(schema).toContain('tags');
		});

		it('can apply auth + office-users modules together', async () => {
			const config: ProjectConfig = {
				...baseConfig,
				modules: ['auth', 'office-users'],
				database: {
					provider: 'neon',
					connectionString: 'postgresql://test:test@localhost/test'
				}
			};
			await generateBaseSite(config);

			// Apply auth first (required for office-users)
			await featureModules['auth'].apply(config, testDir);
			// Then apply office-users
			await featureModules['office-users'].apply(config, testDir);

			// Auth routes should exist
			await expect(access(join(testDir, 'src', 'routes', 'login', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'signup', '+page.svelte'))).resolves.toBeUndefined();

			// Team page should exist
			await expect(access(join(testDir, 'src', 'routes', 'team', '+page.svelte'))).resolves.toBeUndefined();

			// Seed script should exist
			await expect(access(join(testDir, 'scripts', 'seed-office.ts'))).resolves.toBeUndefined();

			// Package.json should have both auth deps and seed script
			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);
			expect(pkg.dependencies['lucia']).toBeDefined();
			expect(pkg.scripts['db:seed-office']).toBeDefined();
		});

		it('can apply all three modules together', async () => {
			const config: ProjectConfig = {
				...baseConfig,
				modules: ['auth', 'blog', 'office-users'],
				database: {
					provider: 'neon',
					connectionString: 'postgresql://test:test@localhost/test'
				}
			};
			await generateBaseSite(config);

			// Apply all modules in order
			await featureModules['auth'].apply(config, testDir);
			await featureModules['blog'].apply(config, testDir);
			await featureModules['office-users'].apply(config, testDir);

			// All routes should exist
			await expect(access(join(testDir, 'src', 'routes', 'login', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'signup', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'blog', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'src', 'routes', 'team', '+page.svelte'))).resolves.toBeUndefined();

			// All seed scripts should exist
			await expect(access(join(testDir, 'scripts', 'seed-blog.ts'))).resolves.toBeUndefined();
			await expect(access(join(testDir, 'scripts', 'seed-office.ts'))).resolves.toBeUndefined();

			// Package.json should have all dependencies and scripts
			const packageJson = await readFile(join(testDir, 'package.json'), 'utf-8');
			const pkg = JSON.parse(packageJson);
			expect(pkg.dependencies['lucia']).toBeDefined();
			expect(pkg.dependencies['drizzle-orm']).toBeDefined();
			expect(pkg.scripts['db:seed-blog']).toBeDefined();
			expect(pkg.scripts['db:seed-office']).toBeDefined();
			expect(pkg.scripts['db:push']).toBeDefined();
		});

		it('module order does not affect final result', async () => {
			// First run: auth then blog
			const config1: ProjectConfig = {
				...baseConfig,
				modules: ['auth', 'blog'],
				database: {
					provider: 'neon',
					connectionString: 'postgresql://test:test@localhost/test'
				}
			};
			const testDir1 = join(testDir, 'order1');
			await mkdir(testDir1, { recursive: true });
			await modules['ssr-site'].generate(config1, testDir1);
			await featureModules['auth'].apply(config1, testDir1);
			await featureModules['blog'].apply(config1, testDir1);

			// Both should have auth and blog routes
			await expect(access(join(testDir1, 'src', 'routes', 'login', '+page.svelte'))).resolves.toBeUndefined();
			await expect(access(join(testDir1, 'src', 'routes', 'blog', '+page.svelte'))).resolves.toBeUndefined();

			// Both should have the necessary dependencies
			const pkg1 = JSON.parse(await readFile(join(testDir1, 'package.json'), 'utf-8'));
			expect(pkg1.dependencies['lucia']).toBeDefined();
			expect(pkg1.scripts['db:seed-blog']).toBeDefined();
		});
	});
});
