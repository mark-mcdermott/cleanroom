import { expect, test } from '@playwright/test';

test.describe('Theme Preview Module', () => {
	test.describe('Page Layout', () => {
		test('theme preview page displays correctly', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have title
			await expect(page.locator('h1:has-text("Theme Preview")')).toBeVisible();
		});

		test('page shows ThemeForseen branding', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have ThemeForseen link
			await expect(page.locator('a[href="https://www.themeforseen.com"]').first()).toBeVisible();
		});

		test('page shows enable preview button when no query param', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have enable button
			await expect(page.locator('button:has-text("Enable Theme Preview Mode")')).toBeVisible();
		});

		test('page has sample cards', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have sample cards
			await expect(page.locator('h2:has-text("Sample Card")')).toBeVisible();
			await expect(page.locator('h2:has-text("Another Card")')).toBeVisible();
		});

		test('page has typography preview section', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have typography section
			await expect(page.locator('h3:has-text("Typography Preview")')).toBeVisible();
		});

		test('page has how it works section', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have instructions
			await expect(page.locator('h2:has-text("How It Works")')).toBeVisible();
		});
	});

	test.describe('Query Parameter Behavior', () => {
		test('preview tab appears with theme_forseen query param', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Should show "Theme Preview Mode Active" indicator
			await expect(page.locator('text=Theme Preview Mode Active')).toBeVisible();

			// Should have palette tab button
			await expect(page.locator('button[aria-label="Toggle theme drawer"]')).toBeVisible();
		});

		test('clicking enable preview adds query param', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Click enable button
			await page.click('button:has-text("Enable Theme Preview Mode")');

			// URL should now have query param
			await expect(page).toHaveURL(/theme_forseen=true/);

			// Active indicator should appear
			await expect(page.locator('text=Theme Preview Mode Active')).toBeVisible();
		});

		test('can disable preview mode', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Click X button to disable
			const closeButton = page.locator('.animate-pulse').locator('..').locator('button');
			await closeButton.click();

			// Should no longer show active indicator
			await expect(page.locator('text=Theme Preview Mode Active')).not.toBeVisible();

			// Enable button should reappear
			await expect(page.locator('button:has-text("Enable Theme Preview Mode")')).toBeVisible();
		});
	});

	test.describe('Theme Drawer', () => {
		test('clicking palette tab opens drawer', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Click the palette tab
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Drawer should appear with ThemeForseen header
			await expect(page.locator('text=ThemeForseen').first()).toBeVisible();

			// Should have Colors and Fonts tabs
			await expect(page.locator('button:has-text("Colors")')).toBeVisible();
			await expect(page.locator('button:has-text("Fonts")')).toBeVisible();
		});

		test('drawer shows color themes', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Should show color theme names in drawer
			await expect(page.locator('button:has-text("Ocean Blue")')).toBeVisible();
			await expect(page.locator('button:has-text("Forest Green")')).toBeVisible();
			await expect(page.locator('button:has-text("Purple Dream")')).toBeVisible();
		});

		test('drawer shows font pairings', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Click Fonts tab
			await page.click('button:has-text("Fonts")');

			// Should show font pairing names in drawer
			await expect(page.locator('button:has-text("Classic")')).toBeVisible();
			await expect(page.locator('button:has-text("Modern")')).toBeVisible();
			await expect(page.locator('button:has-text("Elegant")')).toBeVisible();
		});

		test('can close drawer by clicking backdrop', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Verify drawer is open (backdrop should be visible)
			await expect(page.locator('button[aria-label="Close drawer"]')).toBeVisible();

			// Click backdrop
			await page.click('button[aria-label="Close drawer"]');

			// Backdrop should be gone (drawer is closed)
			await expect(page.locator('button[aria-label="Close drawer"]')).not.toBeVisible();
		});
	});

	test.describe('Theme Selection', () => {
		test('selecting a color theme updates the display', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Click on Forest Green theme
			await page.click('button:has-text("Forest Green")');

			// Current Selection should show Forest Green
			await expect(page.locator('text=Color Theme: Forest Green')).toBeVisible();
		});

		test('selecting a font pairing updates the display', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Click Fonts tab
			await page.click('button:has-text("Fonts")');

			// Click on Elegant font
			await page.click('button:has-text("Elegant")');

			// Current Selection should show Elegant
			await expect(page.locator('text=Font Pairing: Elegant')).toBeVisible();
		});
	});

	test.describe('Dark Mode Toggle', () => {
		test('drawer has dark mode toggle button', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Should have dark mode toggle (sun or moon icon button)
			const darkToggle = page.locator('button[title*="Switch to"]');
			await expect(darkToggle).toBeVisible();
		});

		test('clicking dark mode toggle changes icon', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Click dark mode toggle
			const darkToggle = page.locator('button[title*="Switch to"]');
			const initialTitle = await darkToggle.getAttribute('title');
			await darkToggle.click();

			// Title should change
			const newTitle = await darkToggle.getAttribute('title');
			expect(newTitle).not.toBe(initialTitle);
		});
	});

	test.describe('Current Selection Display', () => {
		test('shows current theme info', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have Current Selection section
			await expect(page.locator('h3:has-text("Current Selection")')).toBeVisible();

			// Should show Color Theme
			await expect(page.locator('text=/Color Theme:/i')).toBeVisible();

			// Should show Font Pairing
			await expect(page.locator('text=/Font Pairing:/i')).toBeVisible();
		});

		test('shows color swatches in current selection', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have color swatch divs
			const swatches = page.locator('.w-8.h-8.rounded');
			const count = await swatches.count();
			expect(count).toBeGreaterThan(0);
		});
	});

	test.describe('Accessibility', () => {
		test('drawer toggle has aria-label', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			const toggleButton = page.locator('button[aria-label="Toggle theme drawer"]');
			await expect(toggleButton).toBeVisible();
		});

		test('page has proper heading structure', async ({ page }) => {
			await page.goto('/modules/theme-preview');

			// Should have h1
			await expect(page.locator('h1')).toBeVisible();

			// Should have h2 for sections
			const h2Count = await page.locator('h2').count();
			expect(h2Count).toBeGreaterThan(0);
		});

		test('backdrop has aria-label', async ({ page }) => {
			await page.goto('/modules/theme-preview?theme_forseen=true');

			// Open drawer
			await page.click('button[aria-label="Toggle theme drawer"]');

			// Backdrop should have aria-label
			const backdrop = page.locator('button[aria-label="Close drawer"]');
			await expect(backdrop).toBeVisible();
		});
	});
});
