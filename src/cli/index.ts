#!/usr/bin/env node
import * as p from '@clack/prompts';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { modules, type ProjectConfig } from './modules';

const execAsync = promisify(exec);

// Helper to check if a command exists
async function commandExists(cmd: string): Promise<boolean> {
	try {
		await execAsync(`which ${cmd}`);
		return true;
	} catch {
		return false;
	}
}

// Helper to check if user is logged into gh
async function isGhLoggedIn(): Promise<boolean> {
	try {
		await execAsync('gh auth status');
		return true;
	} catch {
		return false;
	}
}

// Helper to check if user is logged into wrangler
async function isWranglerLoggedIn(): Promise<boolean> {
	try {
		const { stdout } = await execAsync('wrangler whoami');
		return !stdout.includes('Not logged in');
	} catch {
		return false;
	}
}

// Helper to detect OS
function getOS(): 'macos' | 'linux' | 'windows' {
	const platform = process.platform;
	if (platform === 'darwin') return 'macos';
	if (platform === 'win32') return 'windows';
	return 'linux';
}

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

	// Check and install wrangler
	spinner.start('Checking Wrangler CLI...');
	const hasWrangler = await commandExists('wrangler');

	if (!hasWrangler) {
		spinner.message('Installing Wrangler CLI...');
		try {
			await execAsync('npm install -g wrangler');
			spinner.message('Wrangler CLI installed!');
		} catch {
			spinner.stop('Failed to install Wrangler CLI');
			p.log.error('Please install Wrangler manually: npm install -g wrangler');
			return false;
		}
	}
	spinner.stop('Wrangler CLI ready');

	// Check wrangler login status
	const wranglerLoggedIn = await isWranglerLoggedIn();
	if (!wranglerLoggedIn) {
		p.log.warn('You need to log in to Cloudflare');
		p.note('Run: wrangler login', 'Cloudflare Login Required');

		const loginConfirm = await p.confirm({
			message: 'Press Enter after logging in to continue',
			initialValue: true
		});

		if (p.isCancel(loginConfirm)) {
			p.cancel('Setup cancelled');
			process.exit(0);
		}

		// Verify login
		if (!(await isWranglerLoggedIn())) {
			p.log.error('Wrangler login required. Please run: wrangler login');
			return false;
		}
	}
	p.log.success('Wrangler CLI authenticated');

	return true;
}

// Get GitHub username
async function getGitHubUsername(): Promise<string | null> {
	try {
		const { stdout } = await execAsync('gh api user --jq .login');
		return stdout.trim();
	} catch {
		return null;
	}
}

// Wait for Cloudflare Pages deployment to complete
async function waitForDeployment(
	projectName: string,
	spinner: ReturnType<typeof p.spinner>
): Promise<{ success: boolean; url?: string }> {
	const maxAttempts = 60; // 5 minutes max (5 second intervals)
	let attempts = 0;

	while (attempts < maxAttempts) {
		try {
			const { stdout } = await execAsync(
				`wrangler pages deployment list --project-name=${projectName} --json`
			);
			const deployments = JSON.parse(stdout);

			if (deployments && deployments.length > 0) {
				const latest = deployments[0];
				const status = latest.deployment_trigger?.metadata?.status || latest.latest_stage?.name;

				if (status === 'success' || latest.latest_stage?.name === 'deploy' && latest.latest_stage?.status === 'success') {
					return { success: true, url: latest.url || `https://${projectName}.pages.dev` };
				} else if (status === 'failure' || latest.latest_stage?.status === 'failure') {
					return { success: false };
				}

				// Update spinner with current stage
				const stageName = latest.latest_stage?.name || 'initializing';
				spinner.message(`Deploying... (${stageName})`);
			}
		} catch {
			// API call failed, keep trying
		}

		await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
		attempts++;
	}

	return { success: false }; // Timeout
}

async function main() {
	console.clear();

	p.intro('Welcome to Cleanroom');

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
				hint: 'Single page, no nav/mobile-menu, no breakpoints'
			},
			{
				value: 'landing-simple',
				label: 'Simple landing page',
				hint: 'Single page, no nav/mobile-menu, responsive'
			},
			{
				value: 'landing-sections',
				label: 'Landing page with scroll sections',
				hint: 'Single page with section nav & mobile menu'
			},
			{
				value: 'static-site',
				label: 'Simple static site',
				hint: 'Multiple pages with nav & mobile menu'
			}
		]
	});

	if (p.isCancel(siteType)) {
		p.cancel('Setup cancelled');
		process.exit(0);
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

	// Initialize git
	spinner.start('Initializing git...');
	await execAsync('git init', { cwd: outputDir });
	await execAsync('git add -A', { cwd: outputDir });
	await execAsync('git commit -m "Initial commit from Cleanroom"', { cwd: outputDir });
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

	// Create Cloudflare Pages project
	spinner.start('Creating Cloudflare Pages project...');
	let pagesProjectCreated = false;

	try {
		await execAsync(`wrangler pages project create ${slug} --production-branch=main`);
		spinner.stop('Cloudflare Pages project created!');
		pagesProjectCreated = true;
		config.cloudflare.configured = true;
		p.log.success(`Pages URL: https://${slug}.pages.dev`);
	} catch (error) {
		spinner.stop('Failed to create Cloudflare Pages project');
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';

		// Check if project already exists
		if (errorMsg.includes('already exists')) {
			p.log.warn(`Project "${slug}" already exists in Cloudflare Pages`);
			pagesProjectCreated = true;
			config.cloudflare.configured = true;
		} else {
			p.log.error(`Cloudflare error: ${errorMsg}`);
		}
	}

	if (pagesProjectCreated) {
		// Guide user to connect GitHub (required for automatic deployments)
		p.note(
			[
				'Connect your GitHub repo to enable automatic deployments:',
				'',
				'1. Go to https://dash.cloudflare.com/ > Workers & Pages',
				`2. Click on "${slug}"`,
				'3. Go to Settings > Builds & deployments',
				'4. Click "Connect to Git" and select your repo',
				'5. Set build command: pnpm build',
				'6. Set output directory: .svelte-kit/cloudflare',
				'7. Add environment variable: NODE_VERSION = 22',
				'8. Click "Save and Deploy"'
			].join('\n'),
			'Connect GitHub to Cloudflare Pages'
		);

		await p.confirm({
			message: 'Press Enter after connecting and deploying',
			initialValue: true
		});

		// Wait for deployment to complete
		spinner.start('Waiting for deployment...');
		const deployResult = await waitForDeployment(slug, spinner);

		if (deployResult.success) {
			spinner.stop('Deployment successful!');
			p.log.success(`Live at: ${deployResult.url}`);
		} else {
			spinner.stop('Deployment may still be in progress');
			p.log.warn(
				`Check status at: https://dash.cloudflare.com/ > Workers & Pages > ${slug}`
			);
		}
	} else {
		p.note(
			[
				'You can create the project manually:',
				'1. Go to https://dash.cloudflare.com/',
				'2. Click "Workers & Pages" in the left sidebar',
				'3. Click the "Create" button',
				'4. Connect to Git and select your repo',
				'5. Set build command: pnpm build',
				'6. Set output directory: .svelte-kit/cloudflare',
				'7. Add environment variable: NODE_VERSION = 22'
			].join('\n'),
			'Manual Cloudflare Pages Setup'
		);
	}

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
		'static-site': 'Simple static site'
	};

	p.note(
		[
			`Project: ${config.projectName}`,
			`Logo: ${logoDisplay}`,
			`Site Type: ${siteTypeLabels[config.siteType] || config.siteType}`,
			``,
			`GitHub: ${config.github.repoUrl}`,
			`Cloudflare Pages: https://${slug}.pages.dev`,
			`Custom Domain: ${config.domain.hasDomain ? 'Yes' : 'No'}`
		].join('\n'),
		'Project Configuration'
	);

	p.outro(`Project created in ./generated/${slug}`);

	return config;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

main().catch(console.error);
