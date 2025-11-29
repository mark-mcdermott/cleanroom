import { expect, test } from '@playwright/test';

test.describe('Lobby Module', () => {
	test.describe('Join Page', () => {
		test('lobby page displays correctly', async ({ page }) => {
			await page.goto('/modules/lobby');

			// Should have title
			await expect(page.locator('h1:has-text("Meditation Lobby")')).toBeVisible();

			// Should have join form
			await expect(page.locator('input#name')).toBeVisible();
		});

		test('join form has name input', async ({ page }) => {
			await page.goto('/modules/lobby');

			const nameInput = page.locator('input#name');
			await expect(nameInput).toBeVisible();
			await expect(nameInput).toHaveAttribute('placeholder', /name/i);
		});

		test('join button is visible', async ({ page }) => {
			await page.goto('/modules/lobby');

			const joinButton = page.locator('button:has-text("Join")');
			await expect(joinButton).toBeVisible();
		});

		test('demo mode notice is shown', async ({ page }) => {
			await page.goto('/modules/lobby');

			// Should show demo mode warning
			const demoNotice = page.locator('text=/demo/i');
			await expect(demoNotice.first()).toBeVisible();
		});

		test('setup instructions mention Daily.co', async ({ page }) => {
			await page.goto('/modules/lobby');

			const content = await page.content();
			expect(content.toLowerCase()).toContain('daily.co');
			expect(content.toLowerCase()).toContain('api key');
		});
	});

	test.describe('Room Functionality', () => {
		test('can join room with name', async ({ page }) => {
			await page.goto('/modules/lobby');

			// Wait for hydration
			await page.waitForLoadState('networkidle');

			// Enter name
			await page.fill('input#name', 'Test User');

			// Click join - find button with "Join" text
			await page.click('button:has-text("Join Session")');

			// Should now see video room UI - meditators count
			await expect(page.locator('text=/meditators in session/i')).toBeVisible({ timeout: 10000 });
		});

		test('room shows media controls after joining', async ({ page }) => {
			await page.goto('/modules/lobby');
			await page.waitForLoadState('networkidle');

			// Join room
			await page.fill('input#name', 'Test User');
			await page.click('button:has-text("Join Session")');

			// Wait for room to show
			await expect(page.locator('text=/meditators in session/i')).toBeVisible({ timeout: 10000 });

			// Should have media control buttons (mute, camera, leave)
			await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
		});

		test('room shows mock participants', async ({ page }) => {
			await page.goto('/modules/lobby');
			await page.waitForLoadState('networkidle');

			// Join room
			await page.fill('input#name', 'Test User');
			await page.click('button:has-text("Join Session")');

			// Wait for room to show
			await expect(page.locator('text=/meditators in session/i')).toBeVisible({ timeout: 10000 });

			// Should show participant names
			await expect(page.locator('text="Sarah"').first()).toBeVisible();
		});

		test('chat sidebar is visible after joining', async ({ page }) => {
			await page.goto('/modules/lobby');
			await page.waitForLoadState('networkidle');

			// Join room
			await page.fill('input#name', 'Test User');
			await page.click('button:has-text("Join Session")');

			// Wait for room to show
			await expect(page.locator('text=/meditators in session/i')).toBeVisible({ timeout: 10000 });

			// Should have chat section header
			await expect(page.locator('h3:has-text("Chat")')).toBeVisible();
		});

		test('can send chat message', async ({ page }) => {
			await page.goto('/modules/lobby');
			await page.waitForLoadState('networkidle');

			// Join room
			await page.fill('input#name', 'Test User');
			await page.click('button:has-text("Join Session")');

			// Wait for room to show
			await expect(page.locator('text=/meditators in session/i')).toBeVisible({ timeout: 10000 });

			// Find chat input and send message
			const chatInput = page.locator('input[placeholder*="message" i]');
			await chatInput.fill('Hello everyone!');
			await chatInput.press('Enter');

			// Message should appear
			await expect(page.locator('text="Hello everyone!"')).toBeVisible({ timeout: 5000 });
		});

		test('can leave room', async ({ page }) => {
			await page.goto('/modules/lobby');
			await page.waitForLoadState('networkidle');

			// Join room
			await page.fill('input#name', 'Test User');
			await page.click('button:has-text("Join Session")');

			// Wait for room to show
			await expect(page.locator('text=/meditators in session/i')).toBeVisible({ timeout: 10000 });

			// Click leave button (red background button with phone icon - it's the 3rd button with svg)
			const leaveButton = page.locator('button.bg-red-500');
			await leaveButton.click();

			// Should return to join form
			await expect(page.locator('input#name')).toBeVisible({ timeout: 5000 });
		});
	});

	test.describe('Accessibility', () => {
		test('join form has proper labels', async ({ page }) => {
			await page.goto('/modules/lobby');

			// Name input should have a label
			const label = page.locator('label[for="name"]');
			await expect(label).toBeVisible();
		});

		test('page has proper heading structure', async ({ page }) => {
			await page.goto('/modules/lobby');

			// Should have h1
			await expect(page.locator('h1')).toBeVisible();

			// Should have h2 for sections
			await expect(page.locator('h2').first()).toBeVisible();
		});
	});
});
