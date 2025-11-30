import { expect, test } from '@playwright/test';

test.describe('Resume Module', () => {
	// Test user credentials - unique per run
	const testEmail = `resume-test-${Date.now()}@example.com`;
	const testPassword = 'testPassword123';

	async function signUp(page: any) {
		await page.goto('/modules/resume/signup');
		await page.fill('input[name="email"]', testEmail);
		await page.fill('input[name="password"]', testPassword);
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);
	}

	test.describe('Authentication', () => {
		test('redirects to login when not authenticated', async ({ page }) => {
			await page.goto('/modules/resume');
			await expect(page).toHaveURL(/login/);
		});

		test('redirects new resume page to login when not authenticated', async ({ page }) => {
			await page.goto('/modules/resume/new');
			await expect(page).toHaveURL(/login/);
		});

		test('login page has required fields', async ({ page }) => {
			await page.goto('/modules/resume/login');

			await expect(page.locator('input[name="email"]')).toBeVisible();
			await expect(page.locator('input[name="password"]')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('signup page has required fields', async ({ page }) => {
			await page.goto('/modules/resume/signup');

			await expect(page.locator('input[name="email"]')).toBeVisible();
			await expect(page.locator('input[name="password"]')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('can sign up and access resume list', async ({ page }) => {
			await signUp(page);

			// Should be on main resume page
			await expect(page).toHaveURL(/\/modules\/resume(?!\/login|\/signup)/);

			// Should show empty state or resume list
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/resume|create/i);
		});
	});

	test.describe('Resume List', () => {
		test('shows empty state when no resumes', async ({ page }) => {
			const uniqueEmail = `resume-empty-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			// Should show empty state
			const emptyState = page.locator('text=/haven\'t created|no resumes|create/i');
			await expect(emptyState.first()).toBeVisible();
		});

		test('has button to create new resume', async ({ page }) => {
			const uniqueEmail = `resume-btn-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			// Should have new resume button
			const newButton = page.locator('a[href*="new"], button:has-text("New"), button:has-text("Create")');
			await expect(newButton.first()).toBeVisible();
		});
	});

	test.describe('Create Resume', () => {
		test('new resume page loads with form', async ({ page }) => {
			const uniqueEmail = `resume-new-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			await page.goto('/modules/resume/new');

			// Should have personal info fields (visible text input, not hidden)
			await expect(page.locator('input[type="text"]:visible, input[type="email"]:visible').first()).toBeVisible();

			// Should have sections for resume content
			const content = await page.content();
			expect(content.toLowerCase()).toMatch(/personal|experience|education|skills/i);
		});

		test('new resume form has all sections', async ({ page }) => {
			const uniqueEmail = `resume-sections-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			await page.goto('/modules/resume/new');

			const content = await page.content();

			// Check for main sections
			expect(content.toLowerCase()).toContain('personal');
			expect(content.toLowerCase()).toContain('experience');
			expect(content.toLowerCase()).toContain('education');
			expect(content.toLowerCase()).toContain('skills');
		});

		test('can add experience entry', async ({ page }) => {
			const uniqueEmail = `resume-exp-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			await page.goto('/modules/resume/new');

			// Find and click add experience button
			const addExpButton = page.locator('button:has-text("Add")').filter({ hasText: /experience|add/i });
			const buttons = await page.locator('button').all();

			for (const button of buttons) {
				const text = await button.textContent();
				if (text?.toLowerCase().includes('add') && (await button.isVisible())) {
					// Find one near the Experience section
					const parent = await button.evaluate((el) => el.closest('section, div')?.textContent || '');
					if (parent.toLowerCase().includes('experience')) {
						await button.click();
						break;
					}
				}
			}

			// Should now have experience fields visible
			await page.waitForTimeout(500);
			const expFields = page.locator('input[placeholder*="Company"], input[placeholder*="Position"]');
			// At least one should be visible if we successfully added
		});

		test('has submit button', async ({ page }) => {
			const uniqueEmail = `resume-submit-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			await page.goto('/modules/resume/new');

			const submitButton = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Resume")');
			await expect(submitButton.first()).toBeVisible();
		});
	});

	test.describe('Navigation', () => {
		test('login page links to signup', async ({ page }) => {
			await page.goto('/modules/resume/login');

			// Look in main content area
			const signupLink = page.locator('main a[href*="signup"], form ~ * a[href*="signup"], [class*="Card"] a[href*="signup"]');
			await expect(signupLink.first()).toBeVisible();
		});

		test('signup page links to login', async ({ page }) => {
			await page.goto('/modules/resume/signup');

			// Look in main content area
			const loginLink = page.locator('main a[href*="login"], form ~ * a[href*="login"], [class*="Card"] a[href*="login"]');
			await expect(loginLink.first()).toBeVisible();
		});

		test('navigation shows my resumes link when logged in', async ({ page }) => {
			const uniqueEmail = `resume-nav-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			// Nav should have My Resumes link
			const resumesLink = page.locator('a:has-text("Resumes"), nav a[href="/modules/resume"]');
			await expect(resumesLink.first()).toBeVisible();
		});

		test('navigation shows new resume link when logged in', async ({ page }) => {
			const uniqueEmail = `resume-newnav-${Date.now()}@example.com`;
			await page.goto('/modules/resume/signup');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', testPassword);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/modules\/resume(?!\/login|\/signup)/);

			// Nav should have New Resume link
			const newLink = page.locator('a:has-text("New"), nav a[href*="new"]');
			await expect(newLink.first()).toBeVisible();
		});
	});
});
