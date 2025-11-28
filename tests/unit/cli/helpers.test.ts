import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getOS, slugify, commandExists } from '../../../src/cli/helpers';

describe('CLI Helpers', () => {
	describe('getOS', () => {
		const originalPlatform = process.platform;

		afterEach(() => {
			// Restore original platform
			Object.defineProperty(process, 'platform', {
				value: originalPlatform
			});
		});

		it('returns "macos" for darwin platform', () => {
			Object.defineProperty(process, 'platform', {
				value: 'darwin'
			});
			expect(getOS()).toBe('macos');
		});

		it('returns "windows" for win32 platform', () => {
			Object.defineProperty(process, 'platform', {
				value: 'win32'
			});
			expect(getOS()).toBe('windows');
		});

		it('returns "linux" for linux platform', () => {
			Object.defineProperty(process, 'platform', {
				value: 'linux'
			});
			expect(getOS()).toBe('linux');
		});

		it('returns "linux" for unknown platforms', () => {
			Object.defineProperty(process, 'platform', {
				value: 'freebsd'
			});
			expect(getOS()).toBe('linux');
		});
	});

	describe('slugify', () => {
		it('converts to lowercase', () => {
			expect(slugify('My App')).toBe('my-app');
		});

		it('replaces spaces with hyphens', () => {
			expect(slugify('my cool app')).toBe('my-cool-app');
		});

		it('removes special characters', () => {
			expect(slugify('My App!')).toBe('my-app');
			expect(slugify('App @#$ Name')).toBe('app-name');
		});

		it('handles multiple spaces and hyphens', () => {
			expect(slugify('my   app')).toBe('my-app');
			expect(slugify('my---app')).toBe('my-app');
			expect(slugify('my - app')).toBe('my-app');
		});

		it('trims whitespace', () => {
			expect(slugify('  my app  ')).toBe('my-app');
		});

		it('handles underscores', () => {
			expect(slugify('my_app_name')).toBe('my-app-name');
		});

		it('removes leading and trailing hyphens', () => {
			expect(slugify('-my-app-')).toBe('my-app');
		});

		it('handles emojis by removing them', () => {
			expect(slugify('My 🚀 App')).toBe('my-app');
		});

		it('handles numbers', () => {
			expect(slugify('App 2.0')).toBe('app-20');
			expect(slugify('123 App')).toBe('123-app');
		});

		it('handles empty string', () => {
			expect(slugify('')).toBe('');
		});

		it('handles only special characters', () => {
			expect(slugify('!@#$%')).toBe('');
		});
	});

	describe('commandExists', () => {
		it('returns true for commands that exist (node)', async () => {
			// Node should always exist in the test environment
			const result = await commandExists('node');
			expect(result).toBe(true);
		});

		it('returns false for commands that do not exist', async () => {
			const result = await commandExists('nonexistent-command-xyz123');
			expect(result).toBe(false);
		});

		it('returns true for pnpm (used in this project)', async () => {
			const result = await commandExists('pnpm');
			expect(result).toBe(true);
		});
	});
});
