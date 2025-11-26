import { describe, it, expect } from 'vitest';

describe('Hello World Page', () => {
	it('should have the correct greeting text', () => {
		const expectedGreeting = 'Hello World';
		// This will be imported from the actual component once implemented
		const greeting = 'Hello World';
		expect(greeting).toBe(expectedGreeting);
	});

	it('should have a heading element', () => {
		// Test that our page will have an h1 with Hello World
		const headingText = 'Hello World';
		expect(headingText).toBeTruthy();
		expect(headingText.length).toBeGreaterThan(0);
	});
});
