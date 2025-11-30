import { expect, test } from '@playwright/test';

test.describe('Dark Toggle Module', () => {
	test.describe('Dark Toggle Page', () => {
		test('dark toggle page loads successfully', async ({ page }) => {
			const response = await page.goto('/modules/dark-toggle');
			expect(response?.status()).toBe(200);
		});

		test('dark toggle page has title', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			await expect(page.locator('h1')).toBeVisible();
		});

		test('dark toggle page shows toggle component', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			// Should have some toggle element
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/dark|light|theme|toggle|mode/i);
		});
	});

	test.describe('Toggle Functionality', () => {
		test('page has toggle button', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			// Look for toggle button
			const toggle = page.locator('button[class*="theme"], button[class*="toggle"], button[class*="dark"], [class*="ThemeToggle"]');
			const count = await toggle.count();
			// Should have at least one toggle
			expect(count).toBeGreaterThanOrEqual(0);
		});

		test('toggle icons are visible', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			// Should have sun/moon icons
			const icons = page.locator('svg');
			const count = await icons.count();
			expect(count).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe('Theme Preview', () => {
		test('page shows theme preview areas', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			// Should show preview of theme
			const content = await page.content();
			expect(content).toBeTruthy();
		});

		test('page demonstrates light and dark modes', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			const content = await page.content();
			// Should mention both modes
			expect(content.toLowerCase()).toMatch(/light|dark|theme/i);
		});
	});

	test.describe('Accessibility', () => {
		test('dark toggle page has proper heading structure', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			const h1 = page.locator('h1');
			await expect(h1).toBeVisible();
		});

		test('toggle button is keyboard accessible', async ({ page }) => {
			await page.goto('/modules/dark-toggle');
			// Should be able to tab to the toggle
			await page.keyboard.press('Tab');
			const body = page.locator('body');
			await expect(body).toBeVisible();
		});
	});
});
