import { expect, test } from '@playwright/test';

test.describe('Hello World Page', () => {
	test('home page displays Hello World heading', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toHaveText('Hello World');
	});

	test('home page has correct title', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Cleanroom/);
	});

	test('page is accessible and loads successfully', async ({ page }) => {
		const response = await page.goto('/');
		expect(response?.status()).toBe(200);
	});
});
