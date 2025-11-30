import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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
