import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
	test('home page displays Cleanroom heading', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toHaveText('Cleanroom');
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
