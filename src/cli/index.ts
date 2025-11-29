#!/usr/bin/env node
import * as p from '@clack/prompts';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { modules, type ProjectConfig } from './modules';
import { featureModules } from './modules/features';
import { commandExists, isGhLoggedIn, getOS, getGitHubUsername, slugify } from './helpers';

const execAsync = promisify(exec);

// Setup CLI dependencies (gh and wrangler)
async function setupDependencies(): Promise<boolean> {
	const spinner = p.spinner();
	const os = getOS();

	// Check and install gh CLI
	spinner.start('Checking GitHub CLI...');
	const hasGh = await commandExists('gh');

	if (!hasGh) {
		spinner.message('Installing GitHub CLI...');
		try {
			if (os === 'macos') {
				await execAsync('brew install gh');
			} else if (os === 'linux') {
				// Try common package managers
				try {
					await execAsync(
						'type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y) && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh -y'
					);
				} catch {
					spinner.stop('Could not auto-install GitHub CLI');
					p.log.error('Please install GitHub CLI manually: https://cli.github.com/');
					return false;
				}
			} else {
				spinner.stop('Could not auto-install GitHub CLI');
				p.log.error('Please install GitHub CLI manually: https://cli.github.com/');
				return false;
			}
			spinner.message('GitHub CLI installed!');
		} catch {
			spinner.stop('Failed to install GitHub CLI');
			p.log.error('Please install GitHub CLI manually: https://cli.github.com/');
			return false;
		}
	}
	spinner.stop('GitHub CLI ready');

	// Check gh login status
	const ghLoggedIn = await isGhLoggedIn();
	if (!ghLoggedIn) {
		p.log.warn('You need to log in to GitHub CLI');
		p.note('Run: gh auth login', 'GitHub Login Required');

		const loginConfirm = await p.confirm({
			message: 'Press Enter after logging in to continue',
			initialValue: true
		});

		if (p.isCancel(loginConfirm)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		// Verify login
		if (!(await isGhLoggedIn())) {
			p.log.error('GitHub CLI login required. Please run: gh auth login');
			return false;
		}
	}
	p.log.success('GitHub CLI authenticated');

	return true;
}

async function main() {
	console.clear();

	p.intro('Welcome to cleanroom');

	// Setup dependencies first
	const depsReady = await setupDependencies();
	if (!depsReady) {
		p.cancel('Setup failed - please install required dependencies');
		process.exit(1);
	}

	const projectName = await p.text({
		message: 'What is your project name?',
		placeholder: 'My App',
		validate(value) {
			if (!value) return 'Project name is required';
		}
	});

	if (p.isCancel(projectName)) {
		p.cancel('Setup cancelled');
		process.exit(0);
	}

	const hasLogoFile = await p.confirm({
		message: 'Do you have a logo file?',
		initialValue: false
	});

	if (p.isCancel(hasLogoFile)) {
		p.cancel('Setup cancelled');
		process.exit(0);
	}

	let logo: ProjectConfig['logo'];

	if (hasLogoFile) {
		const logoPath = await p.text({
			message: 'Path to your logo file',
			placeholder: './logo.png',
			validate(value) {
				if (!value) return 'Logo path is required';
			}
		});

		if (p.isCancel(logoPath)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		logo = { type: 'file', value: logoPath };
	} else {
		const emoji = await p.text({
			message: 'Choose an emoji for your project',
			placeholder: '🚀',
			validate(value) {
				if (!value) return 'Emoji is required';
			}
		});

		if (p.isCancel(emoji)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		logo = { type: 'emoji', value: emoji };
	}

	const siteType = await p.select({
		message: 'What type of site do you want to create?',
		options: [
			{
				value: 'demo-page',
				label: 'Simple demo page',
				hint: 'Prerendered, SPA-like navigation, no SSR'
			},
			{
				value: 'landing-simple',
				label: 'Simple landing page',
				hint: 'Prerendered, SPA-like navigation, responsive'
			},
			{
				value: 'landing-sections',
				label: 'Landing page with scroll sections',
				hint: 'Prerendered, SPA-like navigation, section nav & mobile menu'
			},
			{
				value: 'static-site',
				label: 'Simple static site',
				hint: 'Prerendered, SPA-like navigation, multiple pages'
			},
			{
				value: 'ssr-site',
				label: 'SSR site (auth ready)',
				hint: 'Server-rendered, ideal for auth, dynamic content'
			}
		]
	});

	if (p.isCancel(siteType)) {
		p.cancel('Setup cancelled');
		process.exit(0);
	}

	// For SSR sites, set up database and modules
	let databaseConfig: ProjectConfig['database'];
	let selectedModules: ProjectConfig['modules'] = [];
	let darkToggleConfig: ProjectConfig['darkToggle'];

	if (siteType === 'ssr-site') {
		// Neon database setup
		p.log.step('SSR sites need a database. Let\'s set up Neon (free PostgreSQL).');

		p.note(
			[
				'1. Go to https://neon.tech and sign up (free tier available)',
				'2. Create a new project',
				'3. Copy the connection string from the dashboard',
				'   (looks like: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require)'
			].join('\n'),
			'Neon Database Setup'
		);

		const hasNeonAccount = await p.confirm({
			message: 'Do you have your Neon connection string ready?',
			initialValue: false
		});

		if (p.isCancel(hasNeonAccount)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		if (hasNeonAccount) {
			const connectionString = await p.text({
				message: 'Paste your Neon connection string',
				placeholder: 'postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require',
				validate(value) {
					if (!value) return 'Connection string is required';
					if (!value.startsWith('postgresql://')) return 'Must be a PostgreSQL connection string';
				}
			});

			if (p.isCancel(connectionString)) {
				p.cancel('Setup cancelled');
				process.exit(0);
			}

			databaseConfig = {
				provider: 'neon',
				connectionString
			};
			p.log.success('Database configured!');
		} else {
			p.log.warn('You can add the database connection string later in your .env file');
		}

		// Module selection
		const modules = await p.multiselect({
			message: 'Which modules would you like to add?',
			options: [
				{ value: 'auth', label: 'Auth', hint: 'Lucia v3 authentication with login/signup' },
				{ value: 'blog', label: 'Blog', hint: 'Blog with posts and tags' },
				{ value: 'dark-toggle', label: 'Dark Toggle', hint: 'Dark/light mode toggle in nav' },
				{ value: 'leaderboard', label: 'Leaderboard', hint: 'Click game with high score tracking' },
				{ value: 'office-users', label: 'Office Users', hint: 'Seed users from The Office (requires auth)' },
				{ value: 'resume', label: 'Resume', hint: 'Resume builder with PDF export' },
				{ value: 'tracker', label: 'Tracker', hint: 'Activity/habit tracking dashboard' }
			],
			required: false
		});

		if (p.isCancel(modules)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		selectedModules = (modules as string[]).filter((m): m is ProjectConfig['modules'][number] =>
			['auth', 'blog', 'dark-toggle', 'leaderboard', 'office-users', 'resume', 'store', 'tracker', 'widgets'].includes(m)
		);

		// If dark-toggle was selected, ask about mode
		if (selectedModules.includes('dark-toggle')) {
			const themeMode = await p.select({
				message: 'Which theme toggle mode would you like?',
				options: [
					{ value: 'light-dark-system', label: 'Light / Dark / System', hint: 'Three-way toggle with system preference option' },
					{ value: 'light-dark', label: 'Light / Dark only', hint: 'Simple two-way toggle' }
				]
			});

			if (p.isCancel(themeMode)) {
				p.cancel('Setup cancelled');
				process.exit(0);
			}

			darkToggleConfig = {
				mode: themeMode as 'light-dark' | 'light-dark-system'
			};
		}

		if (selectedModules.length > 0) {
			p.log.success(`Selected modules: ${selectedModules.join(', ')}`);
		}
	}

	// Deployment section
	p.log.step(`OK, let's 🚢 this.`);

	const slug = slugify(projectName);
	const outputDir = join(process.cwd(), 'generated', slug);

	// Build config object
	const config: ProjectConfig = {
		projectName,
		logo,
		siteType: siteType as ProjectConfig['siteType'],
		database: databaseConfig,
		modules: selectedModules,
		darkToggle: darkToggleConfig,
		github: {
			repoUrl: '' // Will be set after repo creation
		},
		cloudflare: {
			configured: false
		},
		domain: {
			hasDomain: false,
			configured: false
		}
	};

	// Generate the project first
	const spinner = p.spinner();
	spinner.start('Generating project...');

	const generator = modules[config.siteType];

	if (generator) {
		await generator.generate(config, outputDir);
	} else {
		spinner.stop('Module not yet implemented');
		p.log.warn(`The "${config.siteType}" module is not yet available.`);
		return config;
	}

	spinner.stop('Project generated!');

	// Apply feature modules
	if (config.modules.length > 0) {
		spinner.start('Applying modules...');
		for (const moduleName of config.modules) {
			const featureModule = featureModules[moduleName];
			if (featureModule) {
				spinner.message(`Applying ${moduleName} module...`);
				await featureModule.apply(config, outputDir);
			}
		}
		spinner.stop('Modules applied!');
	}

	// Install dependencies
	spinner.start('Installing dependencies...');
	await execAsync('pnpm install', { cwd: outputDir });
	spinner.stop('Dependencies installed!');

	// If database is configured, set up tables and seed data
	if (config.database && config.modules.length > 0) {
		spinner.start('Setting up database...');
		try {
			await execAsync('pnpm db:push', { cwd: outputDir });
			spinner.stop('Database tables created!');

			// Run seed scripts for selected modules
			if (config.modules.includes('office-users')) {
				spinner.start('Seeding The Office users...');
				await execAsync('pnpm db:seed-office', { cwd: outputDir });
				spinner.stop('The Office users seeded!');
				p.log.success('Login as: michael.scott@dundermifflin.com / dundermifflin');
			}

			if (config.modules.includes('blog')) {
				spinner.start('Seeding blog posts...');
				await execAsync('pnpm db:seed-blog', { cwd: outputDir });
				spinner.stop('Blog posts seeded!');
			}
		} catch (error) {
			spinner.stop('Database setup encountered an error');
			p.log.warn(`Database setup: ${error instanceof Error ? error.message : 'Unknown error'}`);
			p.log.info('You can run database commands manually later: pnpm db:push && pnpm db:seed-office');
		}
	}

	// Initialize git
	spinner.start('Initializing git...');
	await execAsync('git init', { cwd: outputDir });
	await execAsync('git add -A', { cwd: outputDir });
	await execAsync('git commit -m "Initial commit from cleanroom"', { cwd: outputDir });
	await execAsync('git branch -M main', { cwd: outputDir });
	spinner.stop('Git initialized');

	// Create GitHub repo
	spinner.start('Creating GitHub repository...');
	try {
		const ghUsername = await getGitHubUsername();
		await execAsync(`gh repo create ${slug} --public --source=. --push`, { cwd: outputDir });
		config.github.repoUrl = `https://github.com/${ghUsername}/${slug}`;
		spinner.stop('GitHub repository created!');
		p.log.success(`Repository: ${config.github.repoUrl}`);
	} catch (error) {
		spinner.stop('Failed to create GitHub repository');
		p.log.error(
			`GitHub error: ${error instanceof Error ? error.message : 'Unknown error'}. You may need to create the repo manually.`
		);
	}

	// Guide user to create Cloudflare Pages project with Git integration
	p.note(
		[
			'Now let\'s deploy to Cloudflare Pages:',
			'',
			'1. Go to https://dash.cloudflare.com/',
			'2. Click "Workers & Pages" in the left sidebar',
			'3. Click "Create" button',
			'4. Click "Pages" tab, then "Connect to Git"',
			'5. Select your GitHub account and the repo you just created',
			'6. Configure build settings:',
			`   • Project name: ${slug}`,
			'   • Production branch: main',
			'   • Build command: pnpm build',
			'   • Build output directory: .svelte-kit/cloudflare',
			'7. Expand "Environment variables" and add:',
			'   • Variable name: NODE_VERSION',
			'   • Value: 22',
			'8. Click "Save and Deploy"'
		].join('\n'),
		'Create Cloudflare Pages Project'
	);

	await p.confirm({
		message: 'Press Enter when the deployment is complete',
		initialValue: true
	});

	config.cloudflare.configured = true;
	p.log.success(`Site deployed to https://${slug}.pages.dev`);

	// Domain setup
	const hasDomain = await p.confirm({
		message: 'Do you have a custom domain (from Namecheap)?',
		initialValue: false
	});

	if (p.isCancel(hasDomain)) {
		p.cancel('Setup cancelled');
		process.exit(0);
	}

	config.domain.hasDomain = hasDomain;

	if (hasDomain) {
		const domainName = await p.text({
			message: 'What is your domain name?',
			placeholder: 'example.com',
			validate(value) {
				if (!value) return 'Domain name is required';
			}
		});

		if (p.isCancel(domainName)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		p.note(
			[
				'To connect your Namecheap domain to Cloudflare Pages:',
				'',
				'1. In Cloudflare Pages, go to your project > Custom domains',
				'2. Click "Set up a custom domain"',
				`3. Enter: ${domainName}`,
				'4. Cloudflare will provide DNS records to add',
				'',
				'In Namecheap:',
				'5. Go to Domain List > Manage > Advanced DNS',
				'6. Add the CNAME record Cloudflare provided:',
				'   - Type: CNAME',
				'   - Host: @ (or www)',
				`   - Value: ${slug}.pages.dev`,
				'7. Wait for DNS propagation (up to 24 hours)'
			].join('\n'),
			'Domain Setup'
		);

		await p.confirm({
			message: 'Press Enter when you have completed domain setup',
			initialValue: true
		});

		config.domain.configured = true;
	}

	const logoDisplay =
		config.logo.type === 'file' ? `File: ${config.logo.value}` : `Emoji: ${config.logo.value}`;

	const siteTypeLabels: Record<string, string> = {
		'demo-page': 'Simple demo page',
		'landing-simple': 'Simple landing page',
		'landing-sections': 'Landing page with scroll sections',
		'static-site': 'Simple static site',
		'ssr-site': 'SSR site (auth ready)'
	};

	const summaryLines = [
		`Project: ${config.projectName}`,
		`Logo: ${logoDisplay}`,
		`Site Type: ${siteTypeLabels[config.siteType] || config.siteType}`
	];

	if (config.database) {
		summaryLines.push(`Database: Neon PostgreSQL`);
	}

	if (config.modules.length > 0) {
		summaryLines.push(`Modules: ${config.modules.join(', ')}`);
	}

	summaryLines.push(
		``,
		`GitHub: ${config.github.repoUrl}`,
		`Cloudflare Pages: https://${slug}.pages.dev`,
		`Custom Domain: ${config.domain.hasDomain ? 'Yes' : 'No'}`
	);

	p.note(summaryLines.join('\n'), 'Project Configuration');

	p.outro(`Project created in ./generated/${slug}`);

	return config;
}

main().catch(console.error);
