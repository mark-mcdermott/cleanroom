import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, copyFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

// Get the CLI source directory (where this file lives)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to cleanroom's src/lib/components (relative to CLI source)
const CLEANROOM_COMPONENTS_PATH = join(__dirname, '..', 'lib', 'components');

// Helper to check if a command exists
export async function commandExists(cmd: string): Promise<boolean> {
	try {
		await execAsync(`which ${cmd}`);
		return true;
	} catch {
		return false;
	}
}

// Helper to check if user is logged into gh
export async function isGhLoggedIn(): Promise<boolean> {
	try {
		await execAsync('gh auth status');
		return true;
	} catch {
		return false;
	}
}

// Helper to detect OS
export function getOS(): 'macos' | 'linux' | 'windows' {
	const platform = process.platform;
	if (platform === 'darwin') return 'macos';
	if (platform === 'win32') return 'windows';
	return 'linux';
}

// Get GitHub username
export async function getGitHubUsername(): Promise<string | null> {
	try {
		const { stdout } = await execAsync('gh api user --jq .login');
		return stdout.trim();
	} catch {
		return null;
	}
}

// Slugify text for URLs/filenames
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s.-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// Check if a slug is valid (already slugified)
export function isValidSlug(text: string): boolean {
	const slugified = slugify(text);
	return text === slugified && text.length > 0;
}

// Check if a GitHub repo exists
export async function githubRepoExists(username: string, repo: string): Promise<boolean> {
	try {
		await execAsync(`gh repo view ${username}/${repo} --json name`);
		return true;
	} catch {
		return false;
	}
}

// Check if a GitHub repo is blank (has no commits or only initial empty commit)
export async function isGithubRepoBlank(username: string, repo: string): Promise<boolean> {
	try {
		const { stdout } = await execAsync(`gh api repos/${username}/${repo}/commits --jq 'length'`);
		const commitCount = parseInt(stdout.trim(), 10);
		return commitCount === 0;
	} catch {
		// If we can't get commits, assume it might be blank (empty repo returns 409)
		return true;
	}
}

// Recursively copy a directory
export async function copyDir(src: string, dest: string): Promise<void> {
	await mkdir(dest, { recursive: true });
	const entries = await readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath);
		} else {
			await copyFile(srcPath, destPath);
		}
	}
}

// Copy the component library to a generated project
// Options allow selective copying of blocks and/or ui components
export async function copyComponentLibrary(
	outputDir: string,
	options?: {
		blocks?: boolean | string[]; // true = all, string[] = specific components
		ui?: boolean | string[]; // true = all, string[] = specific components
		forms?: boolean;
	}
): Promise<void> {
	const opts = {
		blocks: true,
		ui: true,
		forms: false,
		...options
	};

	const componentsDir = join(outputDir, 'src', 'lib', 'components');

	// Copy blocks
	if (opts.blocks) {
		const blocksSource = join(CLEANROOM_COMPONENTS_PATH, 'blocks');
		const blocksDest = join(componentsDir, 'blocks');

		if (opts.blocks === true) {
			await copyDir(blocksSource, blocksDest);
		} else {
			// Copy specific blocks
			await mkdir(blocksDest, { recursive: true });
			for (const block of opts.blocks) {
				const srcFile = join(blocksSource, `${block}.svelte`);
				const destFile = join(blocksDest, `${block}.svelte`);
				try {
					await copyFile(srcFile, destFile);
				} catch {
					// File might not exist
				}
			}
			// Always copy types.ts and index.ts for blocks
			await copyFile(join(blocksSource, 'types.ts'), join(blocksDest, 'types.ts')).catch(() => {});
			await copyFile(join(blocksSource, 'index.ts'), join(blocksDest, 'index.ts')).catch(() => {});
		}
	}

	// Copy UI components
	if (opts.ui) {
		const uiSource = join(CLEANROOM_COMPONENTS_PATH, 'ui');
		const uiDest = join(componentsDir, 'ui');

		if (opts.ui === true) {
			await copyDir(uiSource, uiDest);
		} else {
			// Copy specific UI component directories
			await mkdir(uiDest, { recursive: true });
			for (const component of opts.ui) {
				const srcDir = join(uiSource, component);
				const destDir = join(uiDest, component);
				try {
					const stats = await stat(srcDir);
					if (stats.isDirectory()) {
						await copyDir(srcDir, destDir);
					}
				} catch {
					// Directory might not exist
				}
			}
			// Always copy index.ts for ui
			await copyFile(join(uiSource, 'index.ts'), join(uiDest, 'index.ts')).catch(() => {});
		}
	}

	// Copy forms if requested
	if (opts.forms) {
		const formsSource = join(CLEANROOM_COMPONENTS_PATH, 'forms');
		const formsDest = join(componentsDir, 'forms');
		await copyDir(formsSource, formsDest).catch(() => {});
	}
}
