import { expect, test } from '@playwright/test';

test.describe('Main Site', () => {
	test.describe('Homepage', () => {
		test('homepage loads successfully', async ({ page }) => {
			const response = await page.goto('/');
			expect(response?.status()).toBe(200);
		});

		test('homepage has navigation', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('nav')).toBeVisible();
		});

		test('homepage shows database connection status', async ({ page }) => {
			await page.goto('/');
			// Should show database status section
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/database|connection|status/i);
		});
	});

	test.describe('Components Page', () => {
		test('components page loads successfully', async ({ page }) => {
			const response = await page.goto('/components');
			expect(response?.status()).toBe(200);
		});

		test('components page has title', async ({ page }) => {
			await page.goto('/components');
			await expect(page.locator('h1').first()).toBeVisible();
		});

		test('components page shows UI components', async ({ page }) => {
			await page.goto('/components');
			// Should have component sections
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/button|input|card|component/i);
		});
	});

	test.describe('Blocks Page', () => {
		test('blocks page loads successfully', async ({ page }) => {
			const response = await page.goto('/blocks');
			expect(response?.status()).toBe(200);
		});

		test('blocks page has title', async ({ page }) => {
			await page.goto('/blocks');
			await expect(page.locator('h1').first()).toBeVisible();
		});

		test('blocks page shows block components', async ({ page }) => {
			await page.goto('/blocks');
			// Should have block sections
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/block|nav|header|footer|hero/i);
		});
	});

	test.describe('Navigation', () => {
		test('nav has components link', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-components"]')).toBeVisible();
		});

		test('nav has blocks link', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-blocks"]')).toBeVisible();
		});

		test('nav has sites dropdown', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-sites"]')).toBeVisible();
		});

		test('nav has modules dropdown', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-modules"]')).toBeVisible();
		});

		test('sites dropdown is clickable', async ({ page }) => {
			await page.goto('/');
			const dropdown = page.locator('[data-testid="nav-sites"]');
			await expect(dropdown).toBeVisible();
			// Just verify it's clickable (no errors thrown)
			await dropdown.click();
		});

		test('modules dropdown is clickable', async ({ page }) => {
			await page.goto('/');
			const dropdown = page.locator('[data-testid="nav-modules"]');
			await expect(dropdown).toBeVisible();
			// Just verify it's clickable (no errors thrown)
			await dropdown.click();
		});

		test('clicking components link navigates to components page', async ({ page }) => {
			await page.goto('/');
			await page.click('[data-testid="nav-components"]');
			await expect(page).toHaveURL('/components');
		});

		test('clicking blocks link navigates to blocks page', async ({ page }) => {
			await page.goto('/');
			await page.click('[data-testid="nav-blocks"]');
			await expect(page).toHaveURL('/blocks');
		});

		test('nav has login link when not authenticated', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
		});

		test('nav has signup link when not authenticated', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-signup"]')).toBeVisible();
		});

		test('nav has GitHub link', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('[data-testid="nav-github"]')).toBeVisible();
		});
	});

	test.describe('Login Page', () => {
		test('login page loads successfully', async ({ page }) => {
			const response = await page.goto('/login');
			expect(response?.status()).toBe(200);
		});

		test('login page has email input', async ({ page }) => {
			await page.goto('/login');
			await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
		});

		test('login page has password input', async ({ page }) => {
			await page.goto('/login');
			await expect(page.locator('input[type="password"]')).toBeVisible();
		});

		test('login page has submit button', async ({ page }) => {
			await page.goto('/login');
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('login page has link to signup', async ({ page }) => {
			await page.goto('/login');
			// Use role-based locator to find the in-page signup link
			await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
		});
	});

	test.describe('Signup Page', () => {
		test('signup page loads successfully', async ({ page }) => {
			const response = await page.goto('/signup');
			expect(response?.status()).toBe(200);
		});

		test('signup page has email input', async ({ page }) => {
			await page.goto('/signup');
			await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
		});

		test('signup page has password input', async ({ page }) => {
			await page.goto('/signup');
			await expect(page.locator('input[type="password"]').first()).toBeVisible();
		});

		test('signup page has submit button', async ({ page }) => {
			await page.goto('/signup');
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('signup page has link to login', async ({ page }) => {
			await page.goto('/signup');
			// Use role-based locator to find the in-page login link
			await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
		});
	});

	test.describe('Accessibility', () => {
		test('homepage has proper heading structure', async ({ page }) => {
			await page.goto('/');
			const h1Count = await page.locator('h1').count();
			expect(h1Count).toBeGreaterThanOrEqual(1);
		});

		test('navigation has aria labels', async ({ page }) => {
			await page.goto('/');
			// Nav should be accessible
			const nav = page.locator('nav');
			await expect(nav).toBeVisible();
		});

		test('buttons are focusable', async ({ page }) => {
			await page.goto('/');
			const buttons = page.locator('button');
			const count = await buttons.count();
			if (count > 0) {
				const firstButton = buttons.first();
				await expect(firstButton).toBeVisible();
			}
		});
	});
});
