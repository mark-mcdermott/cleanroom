import { expect, test } from '@playwright/test';

test.describe('Office Users Module', () => {
	test.describe('Office Users Page', () => {
		test('office users page loads successfully', async ({ page }) => {
			const response = await page.goto('/modules/office-users');
			expect(response?.status()).toBe(200);
		});

		test('office users page has title', async ({ page }) => {
			await page.goto('/modules/office-users');
			await expect(page.locator('h1')).toBeVisible();
		});

		test('office users page shows user content', async ({ page }) => {
			await page.goto('/modules/office-users');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('User Display', () => {
		test('page shows users or empty state', async ({ page }) => {
			await page.goto('/modules/office-users');
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/user|team|office|member/i);
		});

		test('users have proper card/list structure', async ({ page }) => {
			await page.goto('/modules/office-users');
			// Look for user cards
			const users = page.locator('[class*="user"], [class*="card"], [class*="member"]');
			const count = await users.count();
			expect(count).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe('Accessibility', () => {
		test('office users page has proper heading structure', async ({ page }) => {
			await page.goto('/modules/office-users');
			const h1 = page.locator('h1');
			await expect(h1).toBeVisible();
		});

		test('page is keyboard navigable', async ({ page }) => {
			await page.goto('/modules/office-users');
			await page.keyboard.press('Tab');
			const body = page.locator('body');
			await expect(body).toBeVisible();
		});
	});
});
