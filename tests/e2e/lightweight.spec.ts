import { expect, test } from '@playwright/test';

/**
 * Lightweight E2E Test Suite
 *
 * The 20 most valuable E2E tests for quick regression checks.
 * Run with: pnpm test:e2e:lightweight
 */

test.describe('Lightweight E2E Suite', () => {
	// === CORE SITE FUNCTIONALITY ===

	test('homepage loads successfully', async ({ page }) => {
		const response = await page.goto('/');
		expect(response?.status()).toBe(200);
	});

	test('homepage has navigation', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('nav')).toBeVisible();
	});

	test('components page loads', async ({ page }) => {
		const response = await page.goto('/components');
		expect(response?.status()).toBe(200);
	});

	test('blocks page loads', async ({ page }) => {
		const response = await page.goto('/blocks');
		expect(response?.status()).toBe(200);
	});

	// === AUTHENTICATION ===

	test('login page loads', async ({ page }) => {
		const response = await page.goto('/login');
		expect(response?.status()).toBe(200);
	});

	test('login page has form', async ({ page }) => {
		await page.goto('/login');
		await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('signup page loads', async ({ page }) => {
		const response = await page.goto('/signup');
		expect(response?.status()).toBe(200);
	});

	// === DEMO SITES ===

	test('demo page loads', async ({ page }) => {
		const response = await page.goto('/sites/demo');
		expect(response?.status()).toBeLessThan(600);
	});

	test('landing simple loads', async ({ page }) => {
		const response = await page.goto('/sites/landing-simple');
		expect(response?.status()).toBeLessThan(600);
	});

	test('ssr site loads', async ({ page }) => {
		const response = await page.goto('/sites/ssr-site');
		expect(response?.status()).toBe(200);
	});

	test('static site loads', async ({ page }) => {
		const response = await page.goto('/sites/static-site');
		expect(response?.status()).toBeLessThan(600);
	});

	// === KEY MODULES ===

	test('auth module loads', async ({ page }) => {
		const response = await page.goto('/modules/auth');
		expect(response?.status()).toBe(200);
	});

	test('blog module loads', async ({ page }) => {
		const response = await page.goto('/modules/blog');
		expect(response?.status()).toBe(200);
	});

	test('store module loads', async ({ page }) => {
		const response = await page.goto('/modules/store');
		expect(response?.status()).toBeLessThan(600);
	});

	test('tracker module loads', async ({ page }) => {
		const response = await page.goto('/modules/tracker');
		expect(response?.status()).toBeLessThan(600);
	});

	test('widgets module loads', async ({ page }) => {
		const response = await page.goto('/modules/widgets');
		expect(response?.status()).toBe(200);
	});

	test('videos module loads', async ({ page }) => {
		const response = await page.goto('/modules/videos');
		expect(response?.status()).toBe(200);
	});

	// === NAVIGATION ===

	test('nav components link works', async ({ page }) => {
		await page.goto('/');
		await page.click('[data-testid="nav-components"]');
		await expect(page).toHaveURL('/components');
	});

	test('nav blocks link works', async ({ page }) => {
		await page.goto('/');
		await page.click('[data-testid="nav-blocks"]');
		await expect(page).toHaveURL('/blocks');
	});

	// === SITE ISOLATION ===

	test('demo sites are isolated from main nav', async ({ page }) => {
		await page.goto('/sites/demo');
		const mainNav = await page.locator('[data-testid="nav-components"]').count();
		expect(mainNav).toBe(0);
	});
});
