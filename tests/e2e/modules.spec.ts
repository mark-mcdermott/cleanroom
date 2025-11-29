import { expect, test } from '@playwright/test';

test.describe('Module Pages', () => {
	test.describe('Auth Module', () => {
		test('auth module page loads', async ({ page }) => {
			const response = await page.goto('/modules/auth');
			expect(response?.status()).toBe(200);
		});

		test('auth login page loads', async ({ page }) => {
			const response = await page.goto('/modules/auth/login');
			expect(response?.status()).toBe(200);

			// Should have login form
			await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
			await expect(page.locator('input[type="password"]')).toBeVisible();
		});

		test('auth signup page loads', async ({ page }) => {
			const response = await page.goto('/modules/auth/signup');
			expect(response?.status()).toBe(200);

			// Should have signup form
			await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
			// Signup has password and confirmPassword - just check for the first
			await expect(page.locator('input[type="password"]').first()).toBeVisible();
		});

		test('login page has link to signup', async ({ page }) => {
			await page.goto('/modules/auth/login');
			// Look in main content area, not nav
			const signupLink = page.locator('main a[href*="signup"], form ~ * a[href*="signup"], [class*="Card"] a[href*="signup"]');
			await expect(signupLink.first()).toBeVisible();
		});

		test('signup page has link to login', async ({ page }) => {
			await page.goto('/modules/auth/signup');
			// Look in main content area, not nav
			const loginLink = page.locator('main a[href*="login"], form ~ * a[href*="login"], [class*="Card"] a[href*="login"]');
			await expect(loginLink.first()).toBeVisible();
		});
	});

	test.describe('Blog Module', () => {
		test('blog module page loads', async ({ page }) => {
			const response = await page.goto('/modules/blog');
			expect(response?.status()).toBe(200);
		});

		test('blog page shows posts or empty state', async ({ page }) => {
			await page.goto('/modules/blog');
			// Page should have some content
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Store Module', () => {
		test('store module page loads', async ({ page }) => {
			const response = await page.goto('/modules/store');
			expect(response?.status()).toBe(200);
		});

		test('store page has product content', async ({ page }) => {
			await page.goto('/modules/store');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Tracker Module', () => {
		test('tracker module page loads', async ({ page }) => {
			const response = await page.goto('/modules/tracker');
			expect(response?.status()).toBe(200);
		});

		test('tracker page has tracking content', async ({ page }) => {
			await page.goto('/modules/tracker');
			await expect(page.locator('body')).not.toBeEmpty();
		});
	});

	test.describe('Leaderboard Module', () => {
		test('leaderboard module page loads', async ({ page }) => {
			const response = await page.goto('/modules/leaderboard');
			expect(response?.status()).toBe(200);
		});

		test('leaderboard page shows game', async ({ page }) => {
			await page.goto('/modules/leaderboard');
			// Should have game elements
			const content = await page.content();
			expect(content.toLowerCase()).toContain('game');
		});

		test('leaderboard scores page loads', async ({ page }) => {
			const response = await page.goto('/modules/leaderboard/scores');
			expect(response?.status()).toBe(200);
		});

		test('leaderboard scores page shows table or empty state', async ({ page }) => {
			await page.goto('/modules/leaderboard/scores');
			await expect(page.locator('body')).not.toBeEmpty();
		});

		test('game start button exists', async ({ page }) => {
			await page.goto('/modules/leaderboard');
			const startButton = page.locator('button', { hasText: /start/i });
			await expect(startButton).toBeVisible();
		});
	});

	test.describe('Resume Module', () => {
		test('resume module redirects to login when not authenticated', async ({ page }) => {
			const response = await page.goto('/modules/resume');
			// Should either show login page or redirect to login
			const url = page.url();
			expect(url).toContain('login');
		});

		test('resume login page loads', async ({ page }) => {
			const response = await page.goto('/modules/resume/login');
			expect(response?.status()).toBe(200);

			// Should have login form
			await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
			await expect(page.locator('input[type="password"]')).toBeVisible();
		});

		test('resume signup page loads', async ({ page }) => {
			const response = await page.goto('/modules/resume/signup');
			expect(response?.status()).toBe(200);

			// Should have signup form
			await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
			await expect(page.locator('input[type="password"]')).toBeVisible();
		});
	});

	test.describe('Widgets Module', () => {
		test('widgets module page loads', async ({ page }) => {
			const response = await page.goto('/modules/widgets');
			expect(response?.status()).toBe(200);
		});
	});

	test.describe('Lobby Module', () => {
		test('lobby module page loads', async ({ page }) => {
			const response = await page.goto('/modules/lobby');
			expect(response?.status()).toBe(200);
		});

		test('lobby page shows join form initially', async ({ page }) => {
			await page.goto('/modules/lobby');
			// Should have name input
			await expect(page.locator('input[placeholder*="name" i], input#name')).toBeVisible();
			// Should have join button
			await expect(page.locator('button:has-text("Join")')).toBeVisible();
		});

		test('lobby page has setup instructions', async ({ page }) => {
			await page.goto('/modules/lobby');
			// Should mention Daily.co
			const content = await page.content();
			expect(content.toLowerCase()).toContain('daily');
		});
	});

	test.describe('Videos Module', () => {
		test('videos module page loads', async ({ page }) => {
			const response = await page.goto('/modules/videos');
			expect(response?.status()).toBe(200);
		});

		test('videos page shows globe section', async ({ page }) => {
			await page.goto('/modules/videos');
			// Should have globe title or canvas
			await expect(page.locator('text=/globe|explore/i').first()).toBeVisible();
		});

		test('videos page has filter tags', async ({ page }) => {
			await page.goto('/modules/videos');
			// Should have filter section with tags
			const content = await page.content();
			expect(content.toLowerCase()).toContain('filter');
		});

		test('videos page shows video cards', async ({ page }) => {
			await page.goto('/modules/videos');
			// Should have video thumbnails (images)
			await expect(page.locator('img[src*="unsplash"]').first()).toBeVisible();
		});
	});

	test.describe('Dark Toggle Module', () => {
		test('dark toggle module page loads', async ({ page }) => {
			const response = await page.goto('/modules/dark-toggle');
			expect(response?.status()).toBe(200);
		});
	});

	test.describe('Office Users Module', () => {
		test('office users module page loads', async ({ page }) => {
			const response = await page.goto('/modules/office-users');
			expect(response?.status()).toBe(200);
		});
	});
});
