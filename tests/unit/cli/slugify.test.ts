import { describe, it, expect } from 'vitest';

// Copy of slugify function from CLI for testing
function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

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
});
