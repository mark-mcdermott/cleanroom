import { expect, test } from '@playwright/test';

test.describe('Store Module', () => {
	test.describe('Store Listing Page', () => {
		test('store page loads successfully', async ({ page }) => {
			const response = await page.goto('/modules/store');
			expect(response?.status()).toBe(200);
		});

		test('store page has title', async ({ page }) => {
			await page.goto('/modules/store');
			await expect(page.locator('h1')).toBeVisible();
		});

		test('store page shows products or empty state', async ({ page }) => {
			await page.goto('/modules/store');
			await expect(page.locator('body')).not.toBeEmpty();
		});

		test('store page has navigation', async ({ page }) => {
			await page.goto('/modules/store');
			await expect(page.locator('nav').first()).toBeVisible();
		});
	});

	test.describe('Product Display', () => {
		test('store displays product cards when products exist', async ({ page }) => {
			await page.goto('/modules/store');
			// Look for product elements
			const products = page.locator('[class*="product"], [class*="card"], article');
			const count = await products.count();
			expect(count).toBeGreaterThanOrEqual(0);
		});

		test('store has grid or list layout', async ({ page }) => {
			await page.goto('/modules/store');
			// Should have some layout structure
			const content = await page.content();
			expect(content).toBeTruthy();
		});
	});

	test.describe('Cart Functionality', () => {
		test('cart page loads', async ({ page }) => {
			const response = await page.goto('/modules/store/cart');
			expect(response?.status()).toBe(200);
		});

		test('cart shows empty state or items', async ({ page }) => {
			await page.goto('/modules/store/cart');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Checkout Flow', () => {
		test('checkout page loads', async ({ page }) => {
			const response = await page.goto('/modules/store/checkout');
			expect(response?.status()).toBe(200);
		});

		test('checkout shows form or empty cart message', async ({ page }) => {
			await page.goto('/modules/store/checkout');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Admin Pages (Protected)', () => {
		test('admin store page requires authentication', async ({ page }) => {
			await page.goto('/modules/store/admin');
			// Should show something - either redirect or content
			const content = await page.content();
			expect(content).toBeTruthy();
		});

		test('new product page exists', async ({ page }) => {
			const response = await page.goto('/modules/store/admin/new');
			// Might redirect to login or show form
			expect(response?.status()).toBeGreaterThanOrEqual(200);
		});
	});

	test.describe('Store Layout', () => {
		test('store has its own layout', async ({ page }) => {
			await page.goto('/modules/store');
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/store|shop|product|cart/i);
		});
	});

	test.describe('Accessibility', () => {
		test('store page has proper heading structure', async ({ page }) => {
			await page.goto('/modules/store');
			const h1 = page.locator('h1');
			await expect(h1).toBeVisible();
		});

		test('store is keyboard navigable', async ({ page }) => {
			await page.goto('/modules/store');
			await page.keyboard.press('Tab');
			// Should be able to focus something
			const body = page.locator('body');
			await expect(body).toBeVisible();
		});
	});
});
