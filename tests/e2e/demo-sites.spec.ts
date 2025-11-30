import { expect, test } from '@playwright/test';

test.describe('Demo Sites', () => {
	test.describe('Demo Page Site', () => {
		test('demo page loads successfully', async ({ page }) => {
			const response = await page.goto('/sites/demo');
			expect(response?.status()).toBe(200);
		});

		test('demo page has no main site navigation', async ({ page }) => {
			await page.goto('/sites/demo');
			// Demo page should NOT have the main cleanroom nav
			const mainNav = page.locator('nav:has-text("components")');
			await expect(mainNav).toHaveCount(0);
		});

		test('demo page has its own content', async ({ page }) => {
			await page.goto('/sites/demo');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Landing Simple Site', () => {
		test('landing simple page loads successfully', async ({ page }) => {
			const response = await page.goto('/sites/landing-simple');
			expect(response?.status()).toBe(200);
		});

		test('landing simple has no navigation', async ({ page }) => {
			await page.goto('/sites/landing-simple');
			// Simple landing shouldn't have nav
			const mainNav = page.locator('nav:has-text("components")');
			await expect(mainNav).toHaveCount(0);
		});

		test('landing simple has hero content', async ({ page }) => {
			await page.goto('/sites/landing-simple');
			// Should have heading
			await expect(page.locator('h1').first()).toBeVisible();
		});

		test('landing simple has back link to cleanroom', async ({ page }) => {
			await page.goto('/sites/landing-simple');
			// Should have back link
			await expect(page.getByText('Back to cleanroom')).toBeVisible();
		});
	});

	test.describe('Landing Sections Site', () => {
		test('landing sections page loads successfully', async ({ page }) => {
			const response = await page.goto('/sites/landing-sections');
			expect(response?.status()).toBe(200);
		});

		test('landing sections has navigation', async ({ page }) => {
			await page.goto('/sites/landing-sections');
			await expect(page.locator('nav').first()).toBeVisible();
		});

		test('landing sections has multiple sections', async ({ page }) => {
			await page.goto('/sites/landing-sections');
			// Should have sections with IDs for jump links
			await expect(page.locator('#the-map')).toBeVisible();
			await expect(page.locator('#the-crew')).toBeVisible();
			await expect(page.locator('#the-voyage')).toBeVisible();
			await expect(page.locator('#the-treasure')).toBeVisible();
		});

		test('landing sections nav links scroll to sections', async ({ page }) => {
			await page.goto('/sites/landing-sections');
			// Click on a nav link
			const navLink = page.locator('a[href="#the-crew"]');
			if (await navLink.isVisible()) {
				await navLink.click();
				// URL should have hash
				await expect(page).toHaveURL(/.*#the-crew/);
			}
		});

		test('landing sections has hero section', async ({ page }) => {
			await page.goto('/sites/landing-sections');
			await expect(page.locator('h1').first()).toBeVisible();
		});
	});

	test.describe('Static Site', () => {
		test('static site homepage loads successfully', async ({ page }) => {
			const response = await page.goto('/sites/static-site');
			expect(response?.status()).toBe(200);
		});

		test('static site has navigation', async ({ page }) => {
			await page.goto('/sites/static-site');
			await expect(page.locator('nav').first()).toBeVisible();
		});

		test('static site about page loads', async ({ page }) => {
			const response = await page.goto('/sites/static-site/about');
			expect(response?.status()).toBe(200);
		});

		test('static site services page loads', async ({ page }) => {
			const response = await page.goto('/sites/static-site/services');
			expect(response?.status()).toBe(200);
		});

		test('static site contact page loads', async ({ page }) => {
			const response = await page.goto('/sites/static-site/contact');
			expect(response?.status()).toBe(200);
		});

		test('static site contact page has form', async ({ page }) => {
			await page.goto('/sites/static-site/contact');
			await expect(page.locator('form')).toBeVisible();
		});

		test('static site navigation links work', async ({ page }) => {
			await page.goto('/sites/static-site');
			// Click about link
			const aboutLink = page.locator('a[href*="about"]').first();
			if (await aboutLink.isVisible()) {
				await aboutLink.click();
				await expect(page).toHaveURL(/.*\/about/);
			}
		});
	});

	test.describe('SSR Site', () => {
		test('ssr site homepage loads successfully', async ({ page }) => {
			const response = await page.goto('/sites/ssr-site');
			expect(response?.status()).toBe(200);
		});

		test('ssr site has navigation', async ({ page }) => {
			await page.goto('/sites/ssr-site');
			await expect(page.locator('nav').first()).toBeVisible();
		});

		test('ssr site has hero section', async ({ page }) => {
			await page.goto('/sites/ssr-site');
			await expect(page.locator('h1').first()).toBeVisible();
		});

		test('ssr site has features section', async ({ page }) => {
			await page.goto('/sites/ssr-site');
			const content = await page.content();
			expect(content).toContain('Why SSR?');
		});

		test('ssr site has CTA section', async ({ page }) => {
			await page.goto('/sites/ssr-site');
			const content = await page.content();
			expect(content).toContain('Ready to Build?');
		});

		test('ssr site about page loads', async ({ page }) => {
			const response = await page.goto('/sites/ssr-site/about');
			expect(response?.status()).toBe(200);
		});

		test('ssr site services page loads', async ({ page }) => {
			const response = await page.goto('/sites/ssr-site/services');
			expect(response?.status()).toBe(200);
		});

		test('ssr site services page shows services', async ({ page }) => {
			await page.goto('/sites/ssr-site/services');
			const content = await page.content();
			expect(content).toContain('Landing Pages');
			expect(content).toContain('Multi-Page Websites');
		});

		test('ssr site contact page loads', async ({ page }) => {
			const response = await page.goto('/sites/ssr-site/contact');
			expect(response?.status()).toBe(200);
		});

		test('ssr site contact page has form', async ({ page }) => {
			await page.goto('/sites/ssr-site/contact');
			await expect(page.locator('form')).toBeVisible();
		});

		test('ssr site contact form has required fields', async ({ page }) => {
			await page.goto('/sites/ssr-site/contact');
			await expect(page.locator('input[name="name"]')).toBeVisible();
			await expect(page.locator('input[name="email"]')).toBeVisible();
			await expect(page.locator('textarea[name="message"]')).toBeVisible();
		});
	});

	test.describe('Site Isolation', () => {
		test('demo sites do not share main app navigation', async ({ page }) => {
			// Demo page
			await page.goto('/sites/demo');
			let mainNavCount = await page.locator('[data-testid="nav-components"]').count();
			expect(mainNavCount).toBe(0);

			// Landing simple
			await page.goto('/sites/landing-simple');
			mainNavCount = await page.locator('[data-testid="nav-components"]').count();
			expect(mainNavCount).toBe(0);
		});

		test('each site has its own layout', async ({ page }) => {
			// Get content from different sites
			await page.goto('/sites/demo');
			const demoContent = await page.content();

			await page.goto('/sites/landing-simple');
			const landingContent = await page.content();

			await page.goto('/sites/ssr-site');
			const ssrContent = await page.content();

			// They should be different
			expect(demoContent).not.toBe(landingContent);
			expect(landingContent).not.toBe(ssrContent);
		});
	});
});
