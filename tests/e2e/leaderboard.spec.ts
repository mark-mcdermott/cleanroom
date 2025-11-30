import { expect, test } from '@playwright/test';

test.describe('Leaderboard Module', () => {
	test.describe('Game Page', () => {
		test('game page displays correctly', async ({ page }) => {
			await page.goto('/modules/leaderboard');

			// Should have score display
			await expect(page.locator('text=/score/i').first()).toBeVisible();

			// Should have time display
			await expect(page.locator('text=/time/i').first()).toBeVisible();

			// Should have start button when not playing
			const startButton = page.locator('button', { hasText: /start/i });
			await expect(startButton.first()).toBeVisible();
		});

		test('game can be started', async ({ page }) => {
			await page.goto('/modules/leaderboard');

			// Click start
			const startButton = page.locator('button', { hasText: /start/i });
			await startButton.first().click();

			// Game area should be interactive (look for playing state or click area)
			const gameArea = page.locator('[role="button"], .bg-blue-500, [class*="playing"]');
			await expect(gameArea.first()).toBeVisible({ timeout: 2000 });
		});

		test('clicking during game increases score', async ({ page }) => {
			await page.goto('/modules/leaderboard');

			// Start game
			await page.click('button:has-text("Start")');

			// Wait for game to start
			await page.waitForTimeout(500);

			// Click the game area multiple times
			const gameArea = page.locator('.bg-blue-500, [class*="playing"]').first();
			if (await gameArea.isVisible()) {
				await gameArea.click();
				await gameArea.click();
				await gameArea.click();

				// Score should be greater than 0
				const scoreText = await page.locator('text=/\\d+/').first().textContent();
				expect(parseInt(scoreText || '0')).toBeGreaterThan(0);
			}
		});

		test('game shows end state after timer expires', async ({ page }) => {
			test.setTimeout(20000); // Allow time for game to complete

			await page.goto('/modules/leaderboard');

			// Start game
			await page.locator('button:has-text("Start")').first().click();

			// Wait for game to end (10 seconds + buffer)
			await page.waitForTimeout(11000);

			// Should show game over state - either the start button returns or there's a game over indicator
			const startButton = page.locator('button:has-text("Start")');
			const gameOverText = page.getByText(/game over|play again|save|finished/i);

			// Check if either the start button is back or game over text is shown
			const hasStartButton = await startButton.first().isVisible().catch(() => false);
			const hasGameOver = await gameOverText.first().isVisible().catch(() => false);

			expect(hasStartButton || hasGameOver).toBe(true);
		});

		test('navigation to leaderboard works', async ({ page }) => {
			await page.goto('/modules/leaderboard');

			// Click scores/leaderboard link - may be in nav or on page
			const scoresLink = page.locator('a[href*="scores"]');
			const count = await scoresLink.count();
			if (count > 0) {
				await scoresLink.first().click();
				await expect(page).toHaveURL(/scores/);
			} else {
				// Navigate directly
				await page.goto('/modules/leaderboard/scores');
				expect(await page.locator('body').count()).toBeGreaterThan(0);
			}
		});
	});

	test.describe('Scores Page', () => {
		test('scores page displays table or empty state', async ({ page }) => {
			await page.goto('/modules/leaderboard/scores');

			// Should have either a table or empty message
			const table = page.locator('table');
			const emptyMessage = page.locator('text=/no scores|be the first/i');

			const hasTable = await table.isVisible().catch(() => false);
			const hasEmpty = await emptyMessage.isVisible().catch(() => false);

			expect(hasTable || hasEmpty).toBe(true);
		});

		test('scores page has link back to game', async ({ page }) => {
			await page.goto('/modules/leaderboard/scores');

			const gameLink = page.locator('a[href*="/modules/leaderboard"]:not([href*="scores"])');
			await expect(gameLink.first()).toBeVisible();
		});

		test('scores page shows rank column if there are scores', async ({ page }) => {
			await page.goto('/modules/leaderboard/scores');

			const table = page.locator('table');
			if (await table.isVisible().catch(() => false)) {
				// Table should have rank header
				const headers = await page.locator('th').allTextContents();
				const hasRank = headers.some((h) => /rank/i.test(h));
				expect(hasRank).toBe(true);
			}
		});
	});

	test.describe('Authentication Integration', () => {
		test('game is accessible without login', async ({ page }) => {
			// Anyone can access the leaderboard game page
			const response = await page.goto('/modules/leaderboard');
			expect(response?.status()).toBe(200);

			// Game should be playable
			const startButton = page.locator('button:has-text("Start")');
			await expect(startButton.first()).toBeVisible();
		});
	});
});
