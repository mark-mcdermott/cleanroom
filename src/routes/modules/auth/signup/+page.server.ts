import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers } from '$lib/server/db';
import { hashPassword } from '$lib/server/password';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');
	if (sessionId && platform?.env?.DATABASE_URL) {
		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) {
			redirect(302, '/modules/auth');
		}
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const name = formData.get('name');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		// Validate inputs
		if (typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { error: 'Invalid email address' });
		}

		if (typeof password !== 'string' || password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);
		const lucia = createDemoLucia(db);

		// Check if user already exists in demo_users table
		const existingUser = await db
			.select()
			.from(demoUsers)
			.where(eq(demoUsers.email, email.toLowerCase()))
			.limit(1);

		if (existingUser.length > 0) {
			return fail(400, { error: 'An account with this email already exists' });
		}

		// Create user in demo_users table
		const userId = generateIdFromEntropySize(10);
		const passwordHash = await hashPassword(password);

		try {
			await db.insert(demoUsers).values({
				id: userId,
				email: email.toLowerCase(),
				passwordHash,
				name: typeof name === 'string' && name.trim() ? name.trim() : null
			});

			// Create session
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch {
			return fail(500, { error: 'Failed to create account. Please try again.' });
		}

		redirect(302, '/modules/auth');
	}
};
