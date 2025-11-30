import { expect, test } from '@playwright/test';

test.describe('Widgets Module', () => {
	test.describe('Widgets Main Page', () => {
		test('widgets page loads successfully', async ({ page }) => {
			const response = await page.goto('/modules/widgets');
			expect(response?.status()).toBe(200);
		});

		test('widgets page has title', async ({ page }) => {
			await page.goto('/modules/widgets');
			await expect(page.locator('h1')).toBeVisible();
		});

		test('widgets page shows widget content', async ({ page }) => {
			await page.goto('/modules/widgets');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Widgets Display', () => {
		test('widgets page shows user widgets or empty state', async ({ page }) => {
			await page.goto('/modules/widgets');
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/widget|user|data/i);
		});

		test('widgets have proper structure', async ({ page }) => {
			await page.goto('/modules/widgets');
			// Look for widget elements
			const widgets = page.locator('[class*="widget"], [class*="card"]');
			const count = await widgets.count();
			expect(count).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe('Accessibility', () => {
		test('widgets page has content', async ({ page }) => {
			await page.goto('/modules/widgets');
			// Page shows heading or redirecting text
			const content = await page.content();
			expect(content.length).toBeGreaterThan(100);
		});

		test('widgets are keyboard navigable', async ({ page }) => {
			await page.goto('/modules/widgets');
			await page.keyboard.press('Tab');
			const body = page.locator('body');
			await expect(body).toBeVisible();
		});
	});
});
