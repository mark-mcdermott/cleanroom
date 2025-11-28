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
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
